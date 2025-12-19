import {IOrderApiResponse} from '../../types';
import {Component} from '../base/Component';
import {ensureElement} from '../../utils/utils.ts';
import {IEvents} from '../base/Events.ts';
import {eventNames} from '../../utils/constants.ts';

type TSuccessData = Pick<IOrderApiResponse, 'total'>

export class Success extends Component<TSuccessData> {
  protected description: HTMLElement;
  protected orderButtonCloseElement: HTMLButtonElement;
  protected orderTitleElement: HTMLElement;

  constructor(protected events: IEvents, protected container: HTMLElement) {
    super(container);
    this.description = ensureElement<HTMLElement>('.order-success__description', this.container);
    this.orderButtonCloseElement = ensureElement<HTMLButtonElement>('.order-success__button', this.container);
    this.orderTitleElement = ensureElement<HTMLElement>('.order-success__title', this.container);
    this.orderButtonCloseElement.addEventListener('click', () => {
      this.events.emit(eventNames.ORDER_SUCCESS_CLICK_CLOSE);
    });
  }

  set total(value: number) {
      this.description.textContent = `Списано ${value} синапсов`;
    }
}