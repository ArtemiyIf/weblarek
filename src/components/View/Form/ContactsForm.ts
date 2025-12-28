import { Form } from './Form';
import { IEvents } from '../../base/Events';
import { TContactsForm } from '../../../types'; 
import { eventNames } from '../../../utils/constants';

export class ContactsForm extends Form<TContactsForm> {
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
            console.log('Ввод email:', this.emailInput.value);
            
            this.events.emit(eventNames.CONTACTS_FORM_SET_EMAIL, { 
                email: this.emailInput.value 
            });
        });

        this.phoneInput.addEventListener('input', () => {
            console.log('Ввод телефона:', this.phoneInput.value);
            
            this.events.emit(eventNames.CONTACTS_FORM_SET_PHONE, { 
                phone: this.phoneInput.value 
            });
        });

        // Обработчик отправки формы контактов
        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Форма контактов отправлена');
            
            this.events.emit(eventNames.CONTACTS_FORM_SUBMIT);
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    //  ИСПРАВЛЕНИЕ 17: Метод для установки ошибок валидации
    setErrors(emailError?: string, phoneError?: string): void {
        const errors: string[] = [];
        if (emailError) errors.push(emailError);
        if (phoneError) errors.push(phoneError);
        this.errors = errors;
    }

    //  ИСПРАВЛЕНИЕ 18: Метод для управления доступностью кнопки
    setValid(isValid: boolean): void {
        this.submitBtnElem.disabled = !isValid;
    }

    //  ИСПРАВЛЕНИЕ: Обновленный метод render
    render(data?: TContactsForm): HTMLElement {
        // Если переданы данные - обновляем форму
        if (data) {
            this.email = data.email;
            this.phone = data.phone;

            // Отображаем ошибки, если они есть
            if (data.error) {
                this.errors = [data.error];
            } else {
                this.clearErrors();
            }
        }

        // Всегда возвращаем контейнер (даже если данных нет)
        return this.container;
    }
}