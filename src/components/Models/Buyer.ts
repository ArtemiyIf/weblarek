import { IBuyer, TPayment } from '../../types';
import { EventEmitter } from '../base/Events';
import { eventNames } from '../../utils/constants';

export class Buyer {
    private _payment: TPayment = 'card';
    private _email: string = '';
    private _phone: string = '';
    private _address: string = '';
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    setPayment(payment: TPayment): void {
        this._payment = payment;
        this.events.emit(eventNames.CUSTOMER_SET_PAYMENT);
        // 🔧 ДОБАВЛЕНО: Сообщаем о изменении валидации
        this.events.emit('buyer:validationChanged', this.checkValidity());
    }

    setEmail(email: string): void {
        this._email = email;
        this.events.emit(eventNames.CUSTOMER_SET_EMAIL);
        // 🔧 ДОБАВЛЕНО: Сообщаем о изменении валидации
        this.events.emit('buyer:validationChanged', this.checkValidity());
    }

    setPhone(phone: string): void {
        this._phone = phone;
        this.events.emit(eventNames.CUSTOMER_SET_PHONE);
        // 🔧 ДОБАВЛЕНО: Сообщаем о изменении валидации
        this.events.emit('buyer:validationChanged', this.checkValidity());
    }

    setAddress(address: string): void {
        this._address = address;
        this.events.emit(eventNames.CUSTOMER_SET_ADDRESS);
        // 🔧 ДОБАВЛЕНО: Сообщаем о изменении валидации
        this.events.emit('buyer:validationChanged', this.checkValidity());
    }

    getData(): IBuyer {
        return {
            payment: this._payment,
            email: this._email,
            phone: this._phone,
            address: this._address
        };
    }

    clear(): void {
        this._payment = 'card';
        this._email = '';
        this._phone = '';
        this._address = '';
        this.events.emit('buyer:cleared');
        // 🔧 ДОБАВЛЕНО: Сообщаем о изменении валидации
        this.events.emit('buyer:validationChanged', this.checkValidity());
    }

    checkValidity(): Partial<{ [K in keyof IBuyer]: string }> {
        const errors: Partial<{ [K in keyof IBuyer]: string }> = {};
        
        console.log('Проверка валидации Buyer:', {
            payment: this._payment,
            address: this._address,
            email: this._email,
            phone: this._phone
        });
        
        // 🔧 УЛУЧШЕНО: Более строгая валидация способа оплаты
        if (!this._payment || (this._payment !== 'card' && this._payment !== 'cash')) {
            errors.payment = 'Выберите способ оплаты';
            console.log(' Ошибка: способ оплаты не выбран или некорректен');
        }
        
        // 🔧 УЛУЧШЕНО: Проверка на пустую строку и пробелы
        if (!this._address || this._address.trim().length === 0) {
            errors.address = 'Адрес обязателен';
            console.log(' Ошибка: адрес не заполнен');
        }
        
        // 🔧 УЛУЧШЕНО: Базовая валидация email
        if (!this._email || this._email.trim().length === 0) {
            errors.email = 'Email обязателен';
            console.log(' Ошибка: email не заполнен');
        } else if (!this._email.includes('@')) {
            errors.email = 'Введите корректный email';
            console.log(' Ошибка: некорректный формат email');
        }
        
        // 🔧 УЛУЧШЕНО: Базовая валидация телефона
        if (!this._phone || this._phone.trim().length === 0) {
            errors.phone = 'Телефон обязателен';
            console.log(' Ошибка: телефон не заполнен');
        } else if (this._phone.trim().length < 5) {
            errors.phone = 'Телефон слишком короткий';
            console.log(' Ошибка: телефон слишком короткий');
        }
        
        console.log('Результат валидации:', errors);
        return errors;
    }
    
    // 🔧 ДОБАВЛЕНО: Проверка валидности формы заказа (оплата + адрес)
    isOrderFormValid(): boolean {
        const errors = this.checkValidity();
        return !errors.payment && !errors.address;
    }
    
    // 🔧 ДОБАВЛЕНО: Проверка валидности формы контактов (email + телефон)
    isContactsFormValid(): boolean {
        const errors = this.checkValidity();
        return !errors.email && !errors.phone;
    }
    
    // 🔧 ДОБАВЛЕНО: Получить ошибки для формы заказа
    getOrderFormErrors(): string {
        const errors = this.checkValidity();
        return errors.payment || errors.address || '';
    }
    
    // 🔧 ДОБАВЛЕНО: Получить ошибки для формы контактов
    getContactsFormErrors(): string {
        const errors = this.checkValidity();
        return errors.email || errors.phone || '';
    }
}