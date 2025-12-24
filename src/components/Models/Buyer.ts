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

    setPayment(payment: TPayment): void {
        this._payment = payment;
        this.events.emit('buyer:setPayment');
    }

    setEmail(email: string): void {
        this._email = email;
        this.events.emit('buyer:setEmail');
    }

    setPhone(phone: string): void {
        this._phone = phone;
        this.events.emit('buyer:setPhone');
    }

    setAddress(address: string): void {
        this._address = address;
        this.events.emit('buyer:setAddress');
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
    }

    checkValidity(): Partial<{ [K in keyof IBuyer]: string }> {
    const errors: Partial<{ [K in keyof IBuyer]: string }> = {};
    console.log('Проверка валидности Buyer:', {
            payment: this._payment,
            address: this._address,
            email: this._email,
            phone: this._phone
        });
        
        if (!this._payment) {
            errors.payment = 'Выберите способ оплаты';
            console.log('❌ Ошибка: способ оплаты не выбран');
        }
        
        if (!this._address.trim()) {
            errors.address = 'Адрес обязателен';
            console.log('❌ Ошибка: адрес не заполнен');
        }
        
        if (!this._email.trim()) {
            errors.email = 'Email обязателен';
        }
        
        if (!this._phone.trim()) {
            errors.phone = 'Телефон обязателен';
        }
        
        return errors;
  }
}