import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { eventNames } from '../../utils/constants';

export class BasketView extends Component<{ items: HTMLElement[], total: number }> {
    protected listElem: HTMLElement;
    protected buttonOrder: HTMLButtonElement;
    protected priceElem: HTMLElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.listElem = container.querySelector('.basket__list')!;
        this.buttonOrder = container.querySelector('.basket__button')! as HTMLButtonElement;
        this.priceElem = container.querySelector('.basket__price')!;

        this.buttonOrder.addEventListener('click', () => {
        events.emit(eventNames.BASKET_CHECKOUT); 
     });
    }

    set items(items: HTMLElement[]) {
        while (this.listElem.firstChild) {
            this.listElem.removeChild(this.listElem.firstChild);
        }
        items.forEach(item => this.listElem.appendChild(item));
    }

    set total(value: number) {
        this.priceElem.textContent = value.toFixed(2);
        this.buttonOrder.disabled = value === 0;
    }
    
    setButtonState(isDisabled: boolean) {
        this.buttonOrder.disabled = isDisabled;
    }
}