import { IBuyer, TPayment } from '../../types';

export class Buyer {
  private _payment: TPayment | null = null;
  private _email: string | null = null;
  private _phone: string | null = null;
  private _address: string | null = null;

  setPayment(payment: TPayment): void {
    this._payment = payment;
  }

  setEmail(email: string): void {
    this._email = email;
  }

  setPhone(phone: string): void {
    this._phone = phone;
  }

  setAddress(address: string): void {
    this._address = address;
  }

  getData(): IBuyer {
    if (!this._payment || !this._email || !this._phone || !this._address) {
      throw new Error('Не все данные покупателя заполнены');
    }
    return {
      payment: this._payment,
      email: this._email,
      phone: this._phone,
      address: this._address
    };
  }

  clear(): void {
    this._payment = null;
    this._email = null;
    this._phone = null;
    this._address = null;
  }

  checkValidity(): Partial<{ [K in keyof IBuyer]: string }> {
    const errors: Partial<{ [K in keyof IBuyer]: string }> = {};

    if (!this._payment) {
      errors.payment = 'Не выбран способ оплаты';
    }
    if (!this._email) {
      errors.email = 'Укажите email';
    } else if (!/^\S+@\S+\.\S+$/.test(this._email)) {
      errors.email = 'Некорректный email';
    }
    if (!this._phone) {
      errors.phone = 'Укажите телефон';
    } else if (!/^\+?[0-9]{10,15}$/.test(this._phone)) {
      errors.phone = 'Некорректный телефон';
    }
    if (!this._address) {
      errors.address = 'Укажите адрес доставки';
    }

    return errors;
  }
}