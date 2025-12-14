import './scss/styles.scss';
import { Catalog } from './components/Models/Catalog';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { ProductApi } from './services/ProductApi';
import { IApi, IOrderApiRequest } from './types';
import { apiProducts } from './utils/data';
import { Api } from './components/base/Api.ts'; // Импортируем готовый Api

// Создаём экземпляр API с реальным URL
const apiClient = new Api('http://localhost:5173/api/weblarek', {
    headers: {
        'Content-Type': 'application/json'
    }
});

// Тестирование Catalog
console.log('=== Тестирование Catalog ===');
const catalog = new Catalog();
catalog.setItems(apiProducts.items);
console.log('Все товары:', catalog.getItems());
console.log('Товар по ID:', catalog.getItem('854cef69-976d-4c2a-a18c-2aa45046c390'));
catalog.setCurrentItem(apiProducts.items[0]);
console.log('Текущий товар:', catalog.getCurrentItem());

// Тестирование Basket
console.log('\n=== Тестирование Basket ===');
const basket = new Basket();
basket.addItem(apiProducts.items[0]);
basket.addItem(apiProducts.items[1]);
console.log('Товары в корзине:', basket.getItems());
console.log('Общая стоимость:', basket.getTotalPrice());
console.log('Количество товаров:', basket.getTotalItems());
console.log('Есть товар 854cef69-976d-4c2a-a18c-2aa45046c390:', basket.hasItem('854cef69-976d-4c2a-a18c-2aa45046c390'));

// Тестируем очистку корзины
basket.clear();
console.log('После очистки корзины:', basket.getItems(), 'количество:', basket.getTotalItems());

// Тестирование Buyer
console.log('\n=== Тестирование Buyer ===');
const buyer = new Buyer();
buyer.setPayment('card');
buyer.setEmail('email');
buyer.setPhone('number');
buyer.setAddress('Address');
console.log('Данные покупателя:', buyer.getData());
console.log('Ошибки валидации:', buyer.checkValidity());

// Очищаем данные покупателя для тестирования
buyer.clear();
console.log('После очистки покупателя:', buyer.getData());


// Тестирование ProductApi
console.log('\n=== Тестирование ProductApi ===');
const productApi = new ProductApi(apiClient);

// Тестируем getProducts с обработкой ошибок
productApi.getProducts()
    .then(response => {
        console.log('Ответ getProducts:', response);
        // Записываем ответ в модель продуктов
        catalog.setItems(response.items);
        console.log('Обновлённые товары в каталоге:', catalog.getItems());
    })
    .catch(error => {
        console.error('Ошибка getProducts:', error);
    });

// Формируем корректный orderData согласно IOrderApiRequest
const orderData: IOrderApiRequest = {
    payment: buyer.getData().payment,
    email: buyer.getData().email,
    phone: buyer.getData().phone,
    address: buyer.getData().address,
    total: basket.getTotalPrice(),
    items: basket.getItems().map(item => item.id)
};

// Тестируем order с обработкой ошибок
productApi.order(orderData)
    .then(response => {
        if ('id' in response) {
            console.log('Заказ успешно создан! ID:', response.id);
            console.log('Сумма заказа:', response.total);
        } else {
            console.error('Ошибка заказа:', response.error);
        }
    })
    .catch(error => {
        console.error('Критическая ошибка при отправке заказа:', error);
    });