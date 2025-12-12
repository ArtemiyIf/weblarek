import './scss/styles.scss';

import { Catalog } from './components/Models/Catalog';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { ProductApi } from './services/ProductApi';
import { IApi } from './types';
import { apiProducts } from './utils/data';

// Реализация IApi для тестирования
const apiClient: IApi = {
  get: async <T extends object>(uri: string): Promise<T> => {
    console.log(`GET запрос к ${uri}`);
    // Здесь должен быть реальный fetch/axios
    return {} as T;
  },
  post: async <T extends object>(
    uri: string,
    data: object,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<T> => {
    console.log(`POST запрос к ${uri}, данные:`, data);
    return {} as T;
  }
};

// Тестирование Catalog
console.log('=== Тестирование Catalog ===');
const catalog = new Catalog();
catalog.setItems(apiProducts.items);
console.log('Все товары:', catalog.getItems());
console.log('Товар по ID:', catalog.getItem('prod-001'));
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
console.log('Есть товар prod-001:', basket.hasItem('prod-001'));
basket.removeItem(apiProducts.items[0]);
console.log('После удаления:', basket.getItems());

// Тестирование Buyer
console.log('\n=== Тестирование Buyer ===');
const buyer = new Buyer();
buyer.setPayment('card');
buyer.setEmail('user@example.com');
buyer.setPhone('+79991234567');
buyer.setAddress('ул. Примерная, 1');
console.log('Данные покупателя:', buyer.getData());
console.log('Ошибки валидации:', buyer.checkValidity());

// Тестирование ProductApi
console.log('\n=== Тестирование ProductApi ===');
const productApi = new ProductApi(apiClient);
productApi.getProducts().then(response => {
  console.log('Ответ getProducts:', response);
});

const orderData = {
  buyer: buyer.getData(),
  items: basket.getItems(),
  totalAmount: basket.getTotalPrice()
};
productApi.order(orderData).then(response => {
  console.log('Ответ order:', response);
});