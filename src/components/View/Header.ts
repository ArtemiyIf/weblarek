import {IEvents} from '../base/Events.ts';
import {Component} from '../base/Component.ts';
import {eventNames} from '../../utils/constants.ts';
import {ensureElement} from '../../utils/utils.ts';

export interface IHeader {
    count: number;
}

export class Header extends Component<IHeader>{
  protected basketButton: HTMLButtonElement;
  protected counterElement: HTMLElement;

  constructor(protected events: IEvents, protected container: HTMLElement) {
    super(container);
    this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', this.container);
    this.counterElement = ensureElement<HTMLElement>('.header__basket-counter', this.container);
    this.basketButton.addEventListener('click', () => {
      this.events.emit(eventNames.BASKET_OPEN);
    });
  }

  set count(value: number) {
    this.counterElement.textContent = String(value);
  }
}