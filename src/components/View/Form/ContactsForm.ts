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
            console.log(' Ввод email:', this.emailInput.value);
            
            //  ИСПРАВЛЕНО: Используем константу eventNames
            this.events.emit(eventNames.CONTACTS_FORM_SET_EMAIL, { 
                email: this.emailInput.value 
            });
            
            //  ДОБАВЛЕНО: Проверяем состояние кнопки "Оплатить"
            this.updateSubmitButton();
        });

        this.phoneInput.addEventListener('input', () => {
            console.log(' Ввод телефона:', this.phoneInput.value);
            
            //  ИСПРАВЛЕНО: Используем константу eventNames
            this.events.emit(eventNames.CONTACTS_FORM_SET_PHONE, { 
                phone: this.phoneInput.value 
            });
            
            //  ДОБАВЛЕНО: Проверяем состояние кнопки "Оплатить"
            this.updateSubmitButton();
        });

        //  ДОБАВЛЕНО: Обработчик отправки формы контактов
        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(' Форма контактов отправлена');
            
            //  ИСПРАВЛЕНО: Используем константу eventNames
            this.events.emit(eventNames.CONTACTS_FORM_SUBMIT);
        });
    }

    private updateSubmitButton(): void {
        const hasEmail = this.emailInput.value.trim().length > 0;
        const hasPhone = this.phoneInput.value.trim().length > 0;
        
        //  ИСПРАВЛЕНО: Кнопка активна только если ОБА поля заполнены
        const shouldBeActive = hasEmail && hasPhone;
        this.submitBtnElem.disabled = !shouldBeActive;
        
        console.log(' Состояние кнопки "Оплатить":', {
            emailЗаполнен: hasEmail,
            телефонЗаполнен: hasPhone,
            кнопкаАктивна: shouldBeActive
        });
        
        //  ДОБАВЛЕНО: Если форма валидна - очищаем ошибки
        if (shouldBeActive) {
            this.clearErrors();
        }
    }

    set email(value: string) {
        this.emailInput.value = value;

        //  ДОБАВЛЕНО: Обновляем кнопку после установки email
        this.updateSubmitButton();
    }

    set phone(value: string) {
        this.phoneInput.value = value;

        //  ДОБАВЛЕНО: Обновляем кнопку после установки email
        this.updateSubmitButton();
    }

    // Объявляем render, чтобы TypeScript знал про поле `error`
    render(data: TContactsForm): HTMLElement {
        // Устанавливаем значения полей
        this.email = data.email;
        this.phone = data.phone;

        // 🔧 Отображаем ошибки, если они есть (приходят из модели)
        if (data.error) {
            this.errors = [data.error];
        } else {
            this.clearErrors();
        }

        return this.container;
    }
}