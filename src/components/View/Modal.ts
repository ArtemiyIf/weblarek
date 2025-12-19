import { Component } from '../base/Component';
import { IEvents } from '../base/Events';



export class Modal extends Component<void> {
    protected contentElem: HTMLElement;
    protected closeBtn: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.contentElem = container.querySelector('.modal__content')!;
        this.closeBtn = container.querySelector('.modal__close')! as HTMLButtonElement;

        this.closeBtn.addEventListener('click', () => {
            events.emit('modal:close');
        });

        container.addEventListener('click', (e) => {
            if (e.target === container) {
                events.emit('modal:close');
            }
        });
    }

    open(): void {
        this.container.classList.add('modal_active');
    }

    close(): void {
        this.container.classList.remove('modal_active');
    }

    setData(content: HTMLElement): void {
        this.contentElem.innerHTML = '';
        this.contentElem.appendChild(content);
    }
}