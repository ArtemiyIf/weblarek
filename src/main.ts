import './scss/styles.scss';

// Модели
import { Catalog } from './components/Models/Catalog';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

// API
import { ProductApi } from './services/ProductApi';
import { Api } from './components/base/Api';

// Утилиты и константы
import { API_URL, eventNames } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

// Представления
import { Header } from './components/View/Header';
import { Gallery } from './components/View/Gallery';
import { Modal } from './components/View/Modal';
import { BasketView } from './components/View/BasketView';
import { Success } from './components/View/Success';

// Карточки
import { CardCatalog } from './components/View/Card/CardCatalog';
import { CardPreview } from './components/View/Card/CardPreview';
import { CardBasket } from './components/View/Card/CardBasket';

// Формы
import { OrderForm } from './components/View/Form/OrderForm';
import { ContactsForm } from './components/View/Form/ContactsForm';

// Типы
import { IBuyer, IProduct } from './types';

// События
import { EventEmitter } from './components/base/Events';

// --- Инициализация ---
console.log('Инициализация приложения...');

const productApi = new ProductApi(new Api(API_URL));
const eventEmitter = new EventEmitter();

// Модели
const catalogModel = new Catalog(eventEmitter);
const basketModel = new Basket(eventEmitter);
const buyerModel = new Buyer(eventEmitter);

// DOM-элементы
const headerElem = ensureElement<HTMLElement>('.header');
const galleryElem = ensureElement<HTMLElement>('.gallery');
const modalElem = ensureElement<HTMLElement>('#modal-container'); // ← ЭТО НЕ template, а обычный div

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Представления
const headerView = new Header(eventEmitter, headerElem);
const galleryView = new Gallery(galleryElem);
const modalView = new Modal(modalElem, eventEmitter);
const basketView = new BasketView(cloneTemplate(basketTemplate), eventEmitter);
const orderFormView = new OrderForm(cloneTemplate<HTMLFormElement>(orderFormTemplate), eventEmitter);
const contactsFormView = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsFormTemplate), eventEmitter);
const successView = new Success(eventEmitter, cloneTemplate<HTMLElement>(successTemplate));

// --- Функции рендеринга ---
function renderHeader(): void {
    headerView.render({ count: basketModel.getTotalItems() });
}

function renderBasket(): HTMLElement {
    const items = basketModel.getItems().map((item, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => eventEmitter.emit(eventNames.CARD_BASKET_DELETE_ITEM, item)
        });
        return card.render({ ...item, index: index + 1 });
    });
    
    return basketView.render({ 
        items, 
        total: basketModel.getTotalPrice() 
    });
}

function renderCatalog(items: IProduct[]): void {
    console.log('Рендерим каталог:', items.length, 'товаров');
    
    const cards = items.map(item => {
        const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
            onClick: () => eventEmitter.emit(eventNames.CARD_CATALOG_SELECTED, item)
        });
        return card.render(item);
    });
    
    galleryView.render({ items: cards });
    console.log('Создано карточек:', cards.length);
}

function renderPreview(item: IProduct): HTMLElement {
    const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (basketModel.hasItem(item.id)) {
                basketModel.removeItem(item.id);
            } else {
                basketModel.addItem(item);
            }
            modalView.close();
        }
    });
    
    return card.render({
        ...item,
        canBuy: item.price !== null,
        buttonText: basketModel.hasItem(item.id) ? 'Удалить из корзины' : 'В корзину'
    });
}

function renderOrderForm(): HTMLElement {
    const { payment, address } = buyerModel.getData();
    const errors = buyerModel.checkValidity();
    const error = errors.payment || errors.address || '';
    
    return orderFormView.render({ payment, address, error });
}

function renderContactsForm(): HTMLElement {
    const { email, phone } = buyerModel.getData();
    const errors = buyerModel.checkValidity();
    const error = errors.email || errors.phone || '';
    
    return contactsFormView.render({ email, phone, error });
}

// --- Обработчики событий ---


// 1. Загрузка каталога
eventEmitter.on(eventNames.CATALOG_SET_ITEMS, (items: IProduct[]) => {
    console.log('Событие CATALOG_SET_ITEMS:', items.length, 'товаров');
    renderCatalog(items);
});

// 2. Выбор товара из каталога
eventEmitter.on<IProduct>(eventNames.CARD_CATALOG_SELECTED, (item) => {
    console.log('Выбран товар:', item.title);
    catalogModel.setCurrentItem(item);
});

// 3. Открытие превью товара
eventEmitter.on(eventNames.CATALOG_SET_CURRENT_ITEM, (item: IProduct) => {
    console.log('Открываем превью товара');
    modalView.setData(renderPreview(item));
    modalView.open();
});

// 4. Открытие корзины
eventEmitter.on(eventNames.BASKET_OPEN, () => {
    console.log('Открываем корзину');
    modalView.setData(renderBasket());
    modalView.open();
});

// 5. Обновление корзины при изменениях
eventEmitter.on(eventNames.BASKET_CHANGED, () => {
    console.log('Корзина изменилась');
    renderHeader();
});

// 6. Удаление товара из корзины
eventEmitter.on<IProduct>(eventNames.CARD_BASKET_DELETE_ITEM, (item) => {
    console.log('Удаляем товар из корзины:', item.title);
    basketModel.removeItem(item.id);
    // Обновляем отображение корзины, если она открыта
    if (modalView.isOpen() && modalView.getCurrentContent()?.classList.contains('basket')) {
        modalView.setData(renderBasket());
    }
});

// 7. Переход к оформлению заказа
eventEmitter.on(eventNames.BASKET_CHECKOUT, () => {
    console.log('Переходим к оформлению заказа');
    modalView.setData(renderOrderForm());
    modalView.open();
});

// 8. Установка способа оплаты
eventEmitter.on<Pick<IBuyer, 'payment'>>(eventNames.ORDER_FORM_SET_PAYMENT, ({ payment }) => {
    console.log('Установлен способ оплаты:', payment);
    buyerModel.setPayment(payment);
});

// 9. Установка адреса доставки
eventEmitter.on<Pick<IBuyer, 'address'>>(eventNames.ORDER_FORM_SET_ADDRESS, ({ address }) => {
    console.log('Установлен адрес:', address);
    buyerModel.setAddress(address);
});

// 10. Обновление формы заказа при изменении данных
eventEmitter.on(eventNames.CUSTOMER_SET_PAYMENT, () => {
    console.log('Обновляем форму заказа (изменён способ оплаты)');
    if (modalView.isOpen()) {
        modalView.setData(renderOrderForm());
    }
});

eventEmitter.on(eventNames.CUSTOMER_SET_ADDRESS, () => {
    console.log('Обновляем форму заказа (изменён адрес)');
    if (modalView.isOpen()) {
        modalView.setData(renderOrderForm());
    }
});

// 11. Переход к форме контактов
eventEmitter.on(eventNames.ORDER_FORM_SUBMIT, () => {
    console.log('Переходим к форме контактов');
    
    // Проверяем валидность формы заказа
    const errors = buyerModel.checkValidity();
    if (errors.payment || errors.address) {
        console.log('Ошибки в форме заказа:', errors);
        modalView.setData(renderOrderForm());
        return;
    }
    
    modalView.setData(renderContactsForm());
});

eventEmitter.on(eventNames.ORDER_FORM_SUBMIT, () => {
    console.log('Форма заказа отправлена');
    // Проверяем валидность
    const errors = buyerModel.checkValidity();
    if (errors.payment || errors.address) {
        console.log('Ошибки в форме заказа:', errors);
        // Показываем ошибки
        modalView.setData(renderOrderForm());
        return;
    }
    
    // Переходим к форме контактов
    modalView.setData(renderContactsForm());
});

// 12. Установка email
eventEmitter.on<Pick<IBuyer, 'email'>>(eventNames.CONTACTS_FORM_SET_EMAIL, ({ email }) => {
    console.log('Установлен email:', email);
    buyerModel.setEmail(email);
});

// 13. Установка телефона
eventEmitter.on<Pick<IBuyer, 'phone'>>(eventNames.CONTACTS_FORM_SET_PHONE, ({ phone }) => {
    console.log('Установлен телефон:', phone);
    buyerModel.setPhone(phone);
});

// 14. Обновление формы контактов при изменении данных
eventEmitter.on(eventNames.CUSTOMER_SET_EMAIL, () => {
    console.log('Обновляем форму контактов (изменён email)');
    if (modalView.isOpen()) {
        modalView.setData(renderContactsForm());
    }
});

eventEmitter.on(eventNames.CUSTOMER_SET_PHONE, () => {
    console.log('Обновляем форму контактов (изменён телефон)');
    if (modalView.isOpen()) {
        modalView.setData(renderContactsForm());
    }
});

// 15. Закрытие окна успеха
eventEmitter.on(eventNames.ORDER_SUCCESS_CLICK_CLOSE, () => {
    console.log('Закрываем окно успеха');
    modalView.close();
});

// 16. Отправка заказа
eventEmitter.on(eventNames.CONTACTS_FORM_SUBMIT, async () => {
    console.log('Отправляем заказ...');
    
    // Проверяем валидность формы контактов
    const errors = buyerModel.checkValidity();
    if (errors.email || errors.phone) {
        console.log('Ошибки в форме контактов:', errors);
        modalView.setData(renderContactsForm());
        return;
    }
    
    // Проверяем, что корзина не пуста
    if (basketModel.getTotalItems() === 0) {
        console.error('Корзина пуста!');
        return;
    }
    
    try {
        // Формируем данные заказа
        const orderData = {
            ...buyerModel.getData(),
            total: basketModel.getTotalPrice(),
            items: basketModel.getItems().map(item => item.id)
        };
        
        console.log('Отправляем заказ:', orderData);
        
        // Отправляем на сервер
        const response = await productApi.order(orderData);
        
        // Проверяем ответ
        if ('error' in response) {
            console.error('Ошибка при оформлении заказа:', response.error);
            // Можно показать ошибку пользователю
        } else {
            console.log('Заказ успешно оформлен! ID:', response.id, 'Сумма:', response.total);
            
            // Очищаем корзину и данные покупателя
            basketModel.clear();
            buyerModel.clear();
            
            // Показываем окно успеха
            modalView.setData(successView.render({ total: response.total }));
            modalView.open();
        }
        
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
    }
});

// 17. Дополнительные обработчики для обновления UI

// Обновляем корзину при добавлении/удалении товаров
[eventNames.BASKET_ADD_ITEM, eventNames.BASKET_DELETE_ITEM].forEach(eventName => {
    eventEmitter.on(eventName, () => {
        console.log('Обновляем UI корзины');
        renderHeader();
        
        // Если корзина открыта - обновляем её содержимое
        if (modalView.isOpen() && modalView.getCurrentContent()?.classList.contains('basket')) {
            modalView.setData(renderBasket());
        }
    });
});

// Обработка закрытия модального окна
eventEmitter.on('modal:close', () => {
    modalView.close();
});

// --- Инициализация приложения ---

async function initApp() {
    console.log('Запуск приложения...');
    
    try {
        // Загружаем товары
        const response = await productApi.getProducts();
        console.log('Загружено товаров с API:', response.items.length);
        console.log('Первый товар:', response.items[0]);
        
        // Устанавливаем в модель
        catalogModel.setItems(response.items);
        
        // Рендерим шапку
        renderHeader();
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

// Запускаем приложение
initApp();


