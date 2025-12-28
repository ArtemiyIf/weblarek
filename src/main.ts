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
const modalElem = ensureElement<HTMLElement>('#modal-container');

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
    onClick: () => {}
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
                basketModel.removeItem(item.id);
            }
        });
        return card.render({ ...item, index: index + 1 });
    });
    
    const total = basketModel.getTotalPrice();
    
    console.log('Рендерим корзину:', items.length, 'товаров, сумма:', total);
    
    const basketElement = basketView.render({ 
        items, 
        total  
    });
    basketView.setButtonState(total === 0);
    
    return basketElement;
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
    
    return cardPreview.render({
        ...item,
        canBuy: item.price !== null,
        buttonText: basketModel.hasItem(item.id) ? 'Удалить из корзины' : 'В корзину'
    });
}


// --- Обработчики событий ---

// 1. Загрузка каталога
eventEmitter.on(eventNames.CATALOG_SET_ITEMS, (items: IProduct[]) => {
    console.log('Событие CATALOG_SET_ITEMS:', items.length, 'товаров');
    renderCatalog(items);
});

// 2. Выбор товара из каталога
eventEmitter.on(eventNames.CARD_CATALOG_SELECTED, (item: IProduct) => {
    console.log('Выбран товар:', item.title);
    catalogModel.setCurrentItem(item);
});

// 3. Открытие превью товара
eventEmitter.on(eventNames.CATALOG_SET_CURRENT_ITEM, (item: IProduct) => {
    console.log('Открываем превью товара');
    modalView.setData(renderPreview(item));
    modalView.open();
});

// 4. Открытие корзины - ИСПРАВЛЕНО (замечание 1-2)
eventEmitter.on(eventNames.BASKET_OPEN, () => {
    console.log('Открываем корзину');
    const basketContent = basketView.render({
        items: basketModel.getItems().map((item, index) => {
            const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
                onClick: () => {
                    console.log('Клик по удалению товара:', item.title);
                    basketModel.removeItem(item.id);
                }
            });
            return card.render({ ...item, index: index + 1 });
        }),
        total: basketModel.getTotalPrice()
    });
    
    modalView.setData(basketContent);
    modalView.open();
});


// 5. Обновление UI при изменениях в корзине
eventEmitter.on('basket:change', () => {
    console.log('Корзина изменилась, обновляем UI');
    updateBasketUI();
});

// Вспомогательная функция для обновления UI корзины - ИСПРАВЛЕНО
function updateBasketUI(): void {
    // Обновляем шапку
    renderHeader();
    
    // Обновляем список покупок В ЛЮБОМ СЛУЧАЕ (замечание 3-4)
    console.log('Обновляем список покупок');
    renderBasket();
}

// 6. Переход к оформлению заказа
eventEmitter.on(eventNames.BASKET_CHECKOUT, () => {
    console.log('Переходим к оформлению заказа');
    // 🔧 ИСПРАВЛЕНИЕ: Вызываем render() без аргументов
    const orderFormContent = orderFormView.render();
    modalView.setData(orderFormContent);
    modalView.open();
});

// 7. Установка способа оплаты
eventEmitter.on(eventNames.ORDER_FORM_SET_PAYMENT, (data: { payment: string }) => {
    console.log('Установлен способ оплаты:', data.payment);
    eventEmitter.emit('buyer:change', { key: 'payment', value: data.payment });
});

// 8. Установка адреса доставки
eventEmitter.on(eventNames.ORDER_FORM_SET_ADDRESS, (data: { address: string }) => {
    console.log('Установлен адрес:', data.address);
    eventEmitter.emit('buyer:change', { key: 'address', value: data.address });
});

// 9. Установка email
eventEmitter.on(eventNames.CONTACTS_FORM_SET_EMAIL, (data: { email: string }) => {
    console.log('Установлен email:', data.email);
    eventEmitter.emit('buyer:change', { key: 'email', value: data.email });
});

// 10. Установка телефона
eventEmitter.on(eventNames.CONTACTS_FORM_SET_PHONE, (data: { phone: string }) => {
    console.log('Установлен телефон:', data.phone);
    eventEmitter.emit('buyer:change', { key: 'phone', value: data.phone });
});

// 11. Обработчик обновления данных модели
eventEmitter.on('buyer:change', (data: { key: keyof IBuyer, value: any }) => {
    console.log(`Изменение покупателя: ${data.key} = ${data.value}`);
    buyerModel.setData(data.key, data.value);
});

// 12. Обработчик обновления форм (архитектура из замечания ревьюера)
eventEmitter.on('forms:change', () => {
    console.log('Обновление форм после изменения модели покупателя');
    
    const buyer = buyerModel.getData();
    const errors = buyerModel.checkValidity();
    
    // Обновляем форму заказа
    orderFormView.payment = buyer.payment;
    orderFormView.address = buyer.address;
    orderFormView.setErrors(errors.payment, errors.address);
    orderFormView.setValid(!errors.payment && !errors.address);
    
    // Обновляем форму контактов
    contactsFormView.email = buyer.email;
    contactsFormView.phone = buyer.phone;
    contactsFormView.setErrors(errors.email, errors.phone);
    contactsFormView.setValid(!errors.email && !errors.phone);
});

// 13. Переход к форме контактов
eventEmitter.on(eventNames.ORDER_FORM_SUBMIT, () => {
    console.log('Форма заказа отправлена');
    
    const errors = buyerModel.checkValidity();
    if (errors.payment || errors.address) {
        console.log('Ошибки в форме заказа:', errors);
        return;
    }
    
    // 🔧 ИСПРАВЛЕНИЕ: Вызываем render() без аргументов
    const contactsFormContent = contactsFormView.render();
    modalView.setData(contactsFormContent);
});

// 14. Закрытие окна успеха
eventEmitter.on(eventNames.ORDER_SUCCESS_CLICK_CLOSE, () => {
    console.log('Закрываем окно успеха');
    modalView.close();
});

// 15. Отправка заказа
eventEmitter.on(eventNames.CONTACTS_FORM_SUBMIT, async () => {
    console.log('Отправляем заказ...');
    
    // Проверяем валидность формы контактов
    const errors = buyerModel.checkValidity();
    if (errors.email || errors.phone) {
        console.log('Ошибки в форме контактов:', errors);
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
            // ОШИБКА ОТ СЕРВЕРА
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