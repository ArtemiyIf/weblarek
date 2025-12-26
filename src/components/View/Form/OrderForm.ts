import { Form } from './Form';
import { IBuyer, TPayment } from '../../../types';
import { IEvents } from '../../base/Events';
import { ensureAllElements, ensureElement } from "../../../utils/utils";
import { eventNames } from '../../../utils/constants.ts';

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
                const target = evt.currentTarget as HTMLButtonElement;
                const payment = target.name as TPayment;
                
                // Визуальное выделение кнопки
                this.paymentBtns.forEach(btn => {
                    btn.classList.remove('button_alt-active');
                });
                target.classList.add('button_alt-active');
                
                // Отправляем событие о выборе способа оплаты
                this.events.emit(eventNames.ORDER_FORM_SET_PAYMENT, { payment });
            });
        });

        this.addressInput.addEventListener('input', () => {
            console.log('Ввод адреса:', this.addressInput.value);
            this.events.emit(eventNames.ORDER_FORM_SET_ADDRESS, {
                address: this.addressInput.value,
            });
        });

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Форма заказа отправлена');
            
            // ДОБАВЛЕНО: Проверяем, выбрана ли оплата перед отправкой
            const selectedPayment = this.getSelectedPayment();
            if (!selectedPayment) {
                console.warn('Способ оплаты не выбран!');
                return;
            }
            
            this.events.emit(eventNames.ORDER_FORM_SUBMIT);
        });
    }

    // ДОБАВЛЕНО: Метод для получения выбранного способа оплаты
    private getSelectedPayment(): TPayment | null {
        const activeButton = this.paymentBtns.find(btn => 
            btn.classList.contains('button_alt-active')
        );
        return activeButton ? (activeButton.name as TPayment) : null;
    }

    set payment(payment: TPayment) {
        console.log('Установка способа оплаты:', payment);
        this.paymentBtns.forEach((orderBtn: HTMLButtonElement) => {
            const nameOfButton = orderBtn.name as TPayment;
            orderBtn.classList.toggle('button_alt-active', nameOfButton === payment);
        });
    }

    set address(value: string) {
        console.log('Установка адреса:', value);
        this.addressInput.value = value;
    }

    render(data: TOrderForm): HTMLElement {
        this.payment = data.payment;
        this.address = data.address;
        
        // ИСПРАВЛЕНО: Отображаем ошибки из модели
        if (data.error) {
            this.errors = [data.error];
            // ДОБАВЛЕНО: Делаем кнопку неактивной при ошибке
            this.submitBtnElem.disabled = true;
        } else {
            this.clearErrors();
            //  ДОБАВЛЕНО: Делаем кнопку активной если ошибок нет
            this.submitBtnElem.disabled = false;
        }
        
        return this.container;
    }
}