import { Form } from './Form';
import { IEvents } from '../../base/Events';
import { TContactsForm } from '../../../types'; 
import {eventNames} from '../../../utils/constants';


export class ContactsForm extends Form<ContactsForm> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    private events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.emailInput = container.querySelector('input[name="email"]')! as HTMLInputElement;
        this.phoneInput = container.querySelector('input[name="phone"]')! as HTMLInputElement;
        this.events = events;

        // Обработчики для полей ввода
        this.emailInput.addEventListener('input', () => {
            this.events.emit(eventNames.CONTACTS_FORM_SET_EMAIL, { email: this.emailInput.value });
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit(eventNames.CONTACTS_FORM_SET_PHONE, { phone: this.phoneInput.value });
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    validateForm(): Partial<{ email?: string, phone?: string }> {
        const errors: Partial<{ email?: string, phone?: string }> = {};
        if (!this.emailInput.value) errors.email = 'Email обязателен';
        if (!this.phoneInput.value) errors.phone = 'Телефон обязателен';
        return errors;
    }

    // Объявляем render, чтобы TypeScript знал про поле `error`
    render(data: TContactsForm): HTMLElement {
        // Устанавливаем значения полей
        this.email = data.email;
        this.phone = data.phone;

        return this.container;
    }
}