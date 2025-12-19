import { Form } from './Form';
import { IEvents } from '../../base/Events';


export class ContactsForm extends Form<{ email: string, phone: string }> {
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
            this.events.emit('form:email:change', { email: this.emailInput.value });
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit('form:phone:change', { phone: this.phoneInput.value });
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
}