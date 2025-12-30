import { IBuyer, TPayment } from '../../types';
import { EventEmitter } from '../base/Events';
export class Buyer {
    private _payment: TPayment = 'card';
    private _email: string = '';
    private _phone: string = '';
    private _address: string = '';
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

     //  ИСПРАВЛЕНИЕ 7: Единый метод для установки данных
    setData(key: keyof IBuyer, value: any): void {
        switch (key) {
            case 'payment':
                this._payment = value;
                break;
            case 'email':
                this._email = value;
                break;
            case 'phone':
                this._phone = value;
                break;
            case 'address':
                this._address = value;
                break;
        }
        //  ИСПРАВЛЕНИЕ 8: Генерируем событие forms:change после изменения данных
        this.events.emit('forms:change');
    }

     //  ИСПРАВЛЕНИЕ 9: Добавляем вспомогательные методы для обратной совместимости
    setPayment(payment: TPayment): void {
        this.setData('payment', payment);
    }

    setEmail(email: string): void {
        this.setData('email', email);
    }

    setPhone(phone: string): void {
        this.setData('phone', phone);
    }

    setAddress(address: string): void {
        this.setData('address', address);
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
        //  ИСПРАВЛЕНИЕ 10: Генерируем событие forms:change после очистки
        this.events.emit('forms:change');
    }

    checkValidity(): Partial<{ [K in keyof IBuyer]: string }> {
        const errors: Partial<{ [K in keyof IBuyer]: string }> = {};
        
        console.log('Проверка валидации Buyer:', {
            payment: this._payment,
            address: this._address,
            email: this._email,
            phone: this._phone
        });
        
        //  УЛУЧШЕНО: Более строгая валидация способа оплаты
        if (!this._payment || (this._payment !== 'card' && this._payment !== 'cash')) {
            errors.payment = 'Выберите способ оплаты';
            console.log(' Ошибка: способ оплаты не выбран или некорректен');
        }
        
        //  УЛУЧШЕНО: Проверка на пустую строку и пробелы
        if (!this._address || this._address.trim().length === 0) {
            errors.address = 'Адрес обязателен';
            console.log(' Ошибка: адрес не заполнен');
        }
        
        //  УЛУЧШЕНО: Базовая валидация email
        if (!this._email || this._email.trim().length === 0) {
            errors.email = 'Email обязателен';
            console.log(' Ошибка: email не заполнен');
        } else if (!this._email.includes('@')) {
            errors.email = 'Введите корректный email';
            console.log(' Ошибка: некорректный формат email');
        }
        
        //  УЛУЧШЕНО: Базовая валидация телефона
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
   
}