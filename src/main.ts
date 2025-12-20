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

// Представления (Views)
import { Header } from './components/View/Header';
import { Gallery } from './components/View/Gallery';
import { Modal } from './components/View/Modal';
import { BasketView } from './components/View/BasketView';
import { Success } from './components/View/Success';

// Карточки (Cards)
import { CardCatalog } from './components/View/Card/CardCatalog';
import { CardPreview } from './components/View/Card/CardPreview';
import { CardBasket } from './components/View/Card/CardBasket';

// Формы (Forms)
import { OrderForm } from './components/View/Form/OrderForm';
import { ContactsForm } from './components/View/Form/ContactsForm';


// Типы
import { IBuyer, IProduct } from './types';


// События
import { EventEmitter } from './components/base/Events';


// --- Инициализация ---
const productApi = new ProductApi(new Api(API_URL));
const eventEmitter = new EventEmitter();

// Модели
const catalogModel = new Catalog(eventEmitter);
const basketModel = new Basket(eventEmitter);
const buyerModel = new Buyer(eventEmitter);

// DOM-элементы
const headerElem = ensureElement<HTMLElement>('.header');
const galleryElem = ensureElement<HTMLElement>('.gallery');
const modalElem = ensureElement<HTMLTemplateElement>('#modal-container');


// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');


// Экземпляры представлений
const headerView = new Header(eventEmitter, headerElem);
const galleryView = new Gallery(galleryElem);
const modalView = new Modal(modalElem, eventEmitter);
const basketView = new BasketView(cloneTemplate(basketTemplate), eventEmitter);
const orderFormView = new OrderForm(cloneTemplate<HTMLFormElement>(orderFormTemplate),eventEmitter);
const contactsFormView = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsFormTemplate), eventEmitter);
const successView = new Success(eventEmitter, cloneTemplate<HTMLElement>(successTemplate));


// --- Вспомогательные функции рендера ---
function renderHeaderView(): HTMLElement {
    return headerView.render({ count: basketModel.getTotalItems() });
}

function renderBasketView(): HTMLElement {
    const basketItems = basketModel.getItems().map((item, index) =>
        renderCardBasketView(item, index)
    );
    return basketView.render({
        items: basketItems,
        total: basketModel.getTotalPrice(),
    });
}

function renderCardBasketView(item: IProduct, index: number): HTMLElement {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
        onClick: () => eventEmitter.emit(eventNames.CARD_BASKET_DELETE_ITEM, item),
    });
    return card.render({ ...item, index: index + 1 });
}

function renderCardCatalogView(item: IProduct): HTMLElement {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
        onClick: () => eventEmitter.emit(eventNames.CARD_CATALOG_SELECTED, item),
    });
    return card.render(item);
}

function renderCardPreviewView(item: IProduct): HTMLElement {
    const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (!basketModel.hasItem(item.id)) {
                basketModel.addItem(item);
            } else {
                basketModel.removeItem(item.id);
            }
            modalView.close();
        },
    });
    return card.render({
        ...item,
        canBuy: !!item.price,
        buttonText: basketModel.hasItem(item.id) ? 'Удалить из корзины' : 'В корзину',
    });
}

function renderOrderFormView(): HTMLElement {
    const { payment, address } = buyerModel.getData();
    const { payment: paymentError, address: addressError } = buyerModel.checkValidity();
    const error = paymentError || addressError || '';
    return orderFormView.render({ payment, address, error });
}

function renderContactsFormView(): HTMLElement {
    const { email, phone } = buyerModel.getData();
    const { email: emailError, phone: phoneError } = buyerModel.checkValidity();
    const error = emailError || phoneError || '';
    return contactsFormView.render({ email, phone, error });
}

function renderSuccessView(response: { total: number }): HTMLElement {
    return successView.render({ total: response.total });
}

// --- Обработчики событий ---


// 1. Загрузка и отображение каталога товаров
eventEmitter.on(eventNames.CATALOG_SET_ITEMS, () => {
    const catalogCards: HTMLElement[] = catalogModel.getItems().map(renderCardCatalogView);
    galleryView.render({ items: catalogCards });
});

// 2. Выбор товара из каталога (открытие превью)
eventEmitter.on<IProduct>(eventNames.CARD_CATALOG_SELECTED, (item) => {
    catalogModel.setCurrentItem(item);
});

// 3. Обновление модального окна при выборе товара
eventEmitter.on(eventNames.CATALOG_SET_CURRENT_ITEM, () => {
    const currentItem = catalogModel.getCurrentItem();
    if (!currentItem) return;
    modalView.setData(renderCardPreviewView(currentItem));
    modalView.open();
});

// 4. Открытие корзины в модальном окне
eventEmitter.on(eventNames.BASKET_OPEN, () => {
    modalView.setData(renderBasketView());
    modalView.open();
});

// 5. Удаление товара из корзины
eventEmitter.on<IProduct>(eventNames.CARD_BASKET_DELETE_ITEM, (item) => {
    basketModel.removeItem(item.id);
});

// 6. Переход к оформлению заказа (из корзины)
eventEmitter.on(eventNames.BASKET_CHECKOUT, () => {
    modalView.setData(renderOrderFormView());
    modalView.open();
});

// 7. Очистка корзины (после успешного заказа)
eventEmitter.on(eventNames.BASKET_CLEAR, () => {
    renderHeaderView();
});

// 8. Обновление шапки и корзины при изменении состава
[eventNames.BASKET_ADD_ITEM, eventNames.CARD_BASKET_DELETE_ITEM].forEach((eventName) => {
    eventEmitter.on(eventName, () => {
        renderHeaderView();
        renderBasketView();
    });
});

// 9. Установка способа оплаты
eventEmitter.on<Pick<IBuyer, 'payment'>>(eventNames.ORDER_FORM_SET_PAYMENT, ({ payment }) => {
    buyerModel.setPayment(payment);
});

// 10. Установка адреса доставки
eventEmitter.on<Pick<IBuyer, 'address'>>(eventNames.ORDER_FORM_SET_ADDRESS, ({ address }) => {
    buyerModel.setAddress(address);
});

// 11. Перерендер формы заказа при изменении данных покупателя
[eventNames.CUSTOMER_SET_PAYMENT, eventNames.CUSTOMER_SET_ADDRESS].forEach((eventName) => {
    eventEmitter.on(eventName, () => renderOrderFormView());
});

// 12. Переход к форме контактов (после заполнения способа оплаты)
eventEmitter.on(eventNames.ORDER_FORM_SUBMIT, () => {
    modalView.setData(renderContactsFormView());
    modalView.open();
});


// 13. Установка email
eventEmitter.on<Pick<IBuyer, 'email'>>(eventNames.CONTACTS_FORM_SET_EMAIL, ({ email }) => {
    buyerModel.setEmail(email);
});

// 14. Установка телефона
eventEmitter.on<Pick<IBuyer, 'phone'>>(eventNames.CONTACTS_FORM_SET_PHONE, ({ phone }) => {
    buyerModel.setPhone(phone);
});

// 15. Перерендер формы контактов при изменении данных
[eventNames.CUSTOMER_SET_EMAIL, eventNames.CUSTOMER_SET_PHONE].forEach((eventName) => {
    eventEmitter.on(eventName, () => renderContactsFormView());
});

// 16. Закрытие модального окна успеха
eventEmitter.on(eventNames.ORDER_SUCCESS_CLICK_CLOSE, () => {
    modalView.close();
});

/// 17. Отправка заказа (обработка формы контактов)
eventEmitter.on(eventNames.CONTACTS_FORM_SUBMIT, async () => {
    try {
        const response = await productApi.order({
            ...buyerModel.getData(),
            total: basketModel.getTotalPrice(),
            items: basketModel.getItems().map((item) => item.id),
        });

        // Проверяем, что ответ — успешный (имеет поле total)
        if ('total' in response) {
            basketModel.clear();
            buyerModel.clear();
            modalView.setData(renderSuccessView({ total: response.total }));
            modalView.open();
        } else {
            // Если пришла ошибка — обрабатываем её (например, показываем сообщение)
            console.error('Ошибка заказа:', response);
            // Можно добавить показ ошибки в модалке
        }
    } catch (e) {
        console.error('Ошибка при отправке заказа:', e);
    }
});

// --- Инициализация приложения ---

async function initApp() {
    try {
        const response = await productApi.getProducts();
        catalogModel.setItems(response.items);
    } catch (e) {
        console.error('Ошибка загрузки товаров:', e);
    }
}

initApp();


