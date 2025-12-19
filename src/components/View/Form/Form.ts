import { Component } from '../../base/Component';

export abstract class Form<T> extends Component<T> {
    protected submitBtnElem: HTMLButtonElement;
    protected errorsElem: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.submitBtnElem = container.querySelector('button[type="submit"]')! as HTMLButtonElement;
        this.errorsElem = container.querySelector('.form__errors')!;
    }

    // Установить текст ошибок валидации
    set errors(errors: string[]) {
        if (errors.length) {
            this.errorsElem.textContent = errors.join('\n');
            this.submitBtnElem.disabled = true;
        } else {
            this.errorsElem.textContent = '';
            this.submitBtnElem.disabled = false;
        }
    }

    // Очистить ошибки
    clearErrors(): void {
        this.errors = [];
    }
}