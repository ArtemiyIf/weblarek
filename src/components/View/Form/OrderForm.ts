import { Form } from './Form';
import { IBuyer, TPayment} from '../../../types';
import { IEvents } from '../../base/Events';
import { ensureAllElements, ensureElement } from "../../../utils/utils";
import {eventNames} from '../../../utils/constants.ts';

type TOrderForm = Pick<IBuyer, 'address' | 'payment'> & {
    error?: string;
};

export class OrderForm extends Form<TOrderForm> {
    protected paymentBtns: HTMLButtonElement[];
    protected addressInput: HTMLInputElement;

    constructor(protected container: HTMLElement, protected events: IEvents) {
      super(container);
      this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
      this.paymentBtns = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);

      this.paymentBtns.forEach((orderButton: HTMLButtonElement) => {
      orderButton.addEventListener('click', (evt) => {
        evt.preventDefault();
        const target = evt.target as HTMLButtonElement;
        const payment = target.name as TPayment;
         this.paymentBtns.forEach(btn => {
                    btn.classList.remove('button_alt-active');
                });
                target.classList.add('button_alt-active');
        this.events.emit(eventNames.ORDER_FORM_SET_PAYMENT, { payment });
        
                // Проверяем состояние кнопки "Далее"
                this.updateSubmitButton();
        });

    });
    this.addressInput.addEventListener('input', () => {
      console.log('Ввод адреса:', this.addressInput.value);
      this.events.emit(eventNames.ORDER_FORM_SET_ADDRESS, {
                address: this.addressInput.value,
            });
            this.updateSubmitButton();
    });

    this.container.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Форма заказа отправлена');
        this.events.emit(eventNames.ORDER_FORM_SUBMIT);
        });
    }

    set payment(payment: TPayment) {
      console.log('Установка способа оплаты:', payment);
    this.paymentBtns.forEach((orderBtn: HTMLButtonElement) => {
      const nameOfButton = orderBtn.name as TPayment;
      const isActive = nameOfButton === payment;
      orderBtn.classList.toggle('button_alt-active', nameOfButton === payment);
        // Для отладки
            if (isActive) {
                console.log('Кнопка стала активной:', orderBtn.textContent);
            }
    });
    this.updateSubmitButton();
  }

    set address(value: string) {
      console.log('🔄 Установка адреса:', value);
        this.addressInput.value = value;
        this.updateSubmitButton();
    }

     private updateSubmitButton(): void {
        const hasPayment = this.paymentBtns.some(btn => 
            btn.classList.contains('button_alt-active'));
        const hasAddress = this.addressInput.value.trim().length > 0;
        
        // Включаем кнопку только если оба поля заполнены
        const shouldBeActive = hasPayment && hasAddress;
        this.submitBtnElem.disabled = !(hasPayment && hasAddress);
        
        if (shouldBeActive) {
            this.clearErrors();
        }
    }

    validateForm(): Partial<{ [K in keyof IBuyer]: string }> {
        const errors: Partial<{ [K in keyof IBuyer]: string }> = {};
        
        // Проверяем, выбрана ли оплата
        const hasPayment = this.paymentBtns.some(btn => 
            btn.classList.contains('button_alt-active'));
        if (!hasPayment) {
            errors.payment = 'Выберите способ оплаты';
        }
        
        // Проверяем адрес
        if (!this.addressInput.value.trim()) {
            errors.address = 'Адрес обязателен';
        }
        
        return errors;
    }

    render(data: TOrderForm): HTMLElement {
    this.payment = data.payment;
    this.address = data.address;
    this.updateSubmitButton();
    if (data.error) {
        this.errors = [data.error]; // Используем унаследованное свойство
    } else {
        this.clearErrors();
    }
    return this.container;
}

}