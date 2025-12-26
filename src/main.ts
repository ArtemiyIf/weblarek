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
const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
    onClick: () => {} // Пустой обработчик, будет перезаписан
    // Оставляем пустой обработчик, так как в конструкторе CardPreview ожидается параметр actions 
});


// --- Функции рендеринга ---
function renderHeader(): void {
    const count = basketModel.getTotalItems();
    console.log('Обновляем шапку, количество товаров:', count);
    headerView.render({ count });
}

function renderBasket(): HTMLElement {
    const items = basketModel.getItems().map((item, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                console.log('Клик по удалению товара:', item.title);
                basketModel.removeItem(item.id); // ← Прямой вызов модели
                // Модель сама вызовет событие BASKET_DELETE_ITEM
                // которое обновит UI через функцию updateBasketUI()
            }
        });
        return card.render({ ...item, index: index + 1 });
    });
    
    const total = basketModel.getTotalPrice();
    
    console.log('Рендерим корзину:', items.length, 'товаров, сумма:', total);
    
    return basketView.render({ 
        items, 
        total 
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
    console.log('Рендерим превью товара:', item.title);
    
    // ИСПРАВЛЕНО: Обновляем обработчик для текущего товара
    cardPreview.setOnClick(() => {
        if (basketModel.hasItem(item.id)) {
            basketModel.removeItem(item.id);
            console.log('Товар удален из корзины:', item.title);
        } else {
            basketModel.addItem(item);
            console.log('Товар добавлен в корзину:', item.title);
        }
        modalView.close();
    });
    
    // Возвращаем обновленную карточку
    return cardPreview.render({
        ...item,
        canBuy: item.price !== null,
        buttonText: basketModel.hasItem(item.id) ? 'Удалить из корзины' : 'В корзину'
    });
}

function renderOrderForm(): HTMLElement {
    const { payment, address } = buyerModel.getData();
    const errors = buyerModel.checkValidity();
    const error = errors.payment || errors.address || '';
    
    console.log('Рендерим форму заказа:', { payment, address, error });
    return orderFormView.render({ payment, address, error });
}

function renderContactsForm(): HTMLElement {
    const { email, phone } = buyerModel.getData();
    const errors = buyerModel.checkValidity();
    const error = errors.email || errors.phone || '';
    
    console.log('Рендерим форму контактов:', { email, phone, error });
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
    const basketContent = renderBasket();
    modalView.setData(basketContent);
    modalView.open();
});

// 5. Обновление UI при изменениях в корзине (одно событие)
eventEmitter.on('basket:change', () => {
    console.log('Корзина изменилась, обновляем UI');
    updateBasketUI();
});

// Вспомогательная функция для обновления UI корзины
function updateBasketUI(): void {
    // Обновляем шапку
    renderHeader();
    
    // Если корзина открыта в модальном окне - обновляем её содержимое
    if (modalView.isOpen() && isBasketOpen()) {
        console.log('Корзина открыта, обновляем содержимое');
        const updatedBasket = renderBasket();
        modalView.setData(updatedBasket);
    }
}

// Проверяем, открыта ли сейчас корзина
function isBasketOpen(): boolean {
    const currentContent = modalView.getCurrentContent();
    return currentContent ? currentContent.classList.contains('basket') : false;
}


// 6. Переход к оформлению заказа
eventEmitter.on(eventNames.BASKET_CHECKOUT, () => {
    console.log('Переходим к оформлению заказа');
    modalView.setData(renderOrderForm());
    modalView.open();
});

// 7. Установка способа оплаты
eventEmitter.on<Pick<IBuyer, 'payment'>>(eventNames.ORDER_FORM_SET_PAYMENT, ({ payment }) => {
    console.log('Установлен способ оплаты:', payment);
    buyerModel.setPayment(payment);
});

// 8. Установка адреса доставки
eventEmitter.on<Pick<IBuyer, 'address'>>(eventNames.ORDER_FORM_SET_ADDRESS, ({ address }) => {
    console.log('Установлен адрес:', address);
    buyerModel.setAddress(address);
});

// 9 ДОБАВЬТЕ ЗДЕСЬ: Обработчик изменения валидации
eventEmitter.on('buyer:validationChanged', (errors: Partial<{ [K in keyof IBuyer]: string }>) => {
    console.log('Валидация изменилась:', errors);
    
    // Если открыта форма заказа - обновляем её
    if (modalView.isOpen() && modalView.getCurrentContent()?.querySelector('form[name="order"]')) {
        console.log('Обновляем форму заказа с новыми ошибками валидации');
        modalView.setData(renderOrderForm());
    }
    
    // Если открыта форма контактов - обновляем её
    if (modalView.isOpen() && modalView.getCurrentContent()?.querySelector('form[name="contacts"]')) {
        console.log('Обновляем форму контактов с новыми ошибками валидации');
        modalView.setData(renderContactsForm());
    }
});

// 10. Обновление формы заказа при изменении данных
eventEmitter.on(eventNames.CUSTOMER_SET_PAYMENT, () => {
    console.log('Обновляем форму заказа (изменён способ оплаты)');
    // Проверяем валидность формы заказа
    const errors = buyerModel.checkValidity();
    if (errors.payment || errors.address) {
        console.log('Ошибки в форме заказа:', errors);
        modalView.setData(renderOrderForm());
        return;
    }
    
    modalView.setData(renderContactsForm());
});

eventEmitter.on(eventNames.CUSTOMER_SET_ADDRESS, () => {
    console.log('Обновляем форму заказа (изменён адрес)');
    if (modalView.isOpen()) {
        modalView.setData(renderOrderForm());
    }
});

// 11. Переход к форме контактов
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
        
        // Проверяем, что ответ успешный (есть id)
        if ('id' in response) {
            // УСПЕШНЫЙ ОТВЕТ
            console.log('Заказ успешно оформлен! ID:', response.id, 'Сумма:', response.total);
            
            // Очищаем корзину и данные покупателя
            basketModel.clear();
            buyerModel.clear();
            
            // Показываем окно успеха
            modalView.setData(successView.render({ total: response.total }));
            modalView.open();
        } else {
            // ОШИБКА ОТ СЕРВЕРА (хотя по Postman не должно быть)
            console.error('Ошибка при оформлении заказа:', response);
        }
        
    } catch (error) {
        // ОШИБКА СЕТИ
        console.error('Ошибка при отправке заказа:', error);
    }
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


