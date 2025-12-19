import { Form } from './Form';
import { IBuyer, TPayment} from '../../../types';
import { IEvents } from '../../base/Events';
import { ensureAllElements, ensureElement } from "../../../utils/utils";

type TOrderForm = Pick<IBuyer, 'address' | 'payment'>;

export class OrderForm extends Form<TOrderForm> {
    protected paymentBtns: HTMLButtonElement[];
    protected addressInput: HTMLInputElement;

    constructor(protected container: HTMLElement, protected events: IEvents) {
        super(container);
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this.paymentBtns = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);
        this.paymentBtns.forEach((orderButton: HTMLButtonElement) => {
      orderButton.addEventListener('click', (evt) => {
        const target = evt.target as HTMLButtonElement;
        const payment = target.name as TPayment;
        this.events.emit<Pick<IBuyer, 'payment'>>('order:formSetPayment', {
          payment,
        });
      });
    });
    this.addressInput.addEventListener('input', () => {
      this.events.emit<Pick<IBuyer, 'address'>>('order:formSetAddress', {
        address: this.addressInput.value,
      });
    });;

        // Обработчик для поля адреса
        this.addressInput.addEventListener('input', () => {
            this.events.emit('form:address:change', { address: this.addressInput.value });
        });
    }

    set payment(payment: TPayment) {
    this.paymentBtns.forEach((orderBtn: HTMLButtonElement) => {
      const nameOfButton = orderBtn.name as TPayment;
      orderBtn.classList.toggle('button_alt-active', nameOfButton === payment);
    });
  }

    set address(value: string) {
        this.addressInput.value = value;
    }

    validateForm(): Partial<{ [K in keyof IBuyer]: string }> {
        const errors: Partial<{ [K in keyof IBuyer]: string }> = {};
        if (!this.addressInput.value) {
            errors.address = 'Адрес обязателен';
        }
        return errors;
    }
}