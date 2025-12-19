import { Card } from './Card';
import { ensureElement } from "../../../utils/utils";

type TBasketAction = {
  onClick?: () => void;
};
type TCardBasketData = {
  index: number
};

export class CardBasket extends Card<TCardBasketData> {
    private indexElem: HTMLElement;
    private deleteBtn: HTMLButtonElement;

    constructor(protected container: HTMLElement,protected actions?: TBasketAction) {
        super(container);
        this.indexElem = ensureElement<HTMLSpanElement>('.basket__item-index', this.container);
        this.deleteBtn = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        if (this.actions?.onClick) {
      this.deleteBtn.addEventListener('click', this.actions.onClick)
    }
    }

    setIndex(value: number): void {
        this.indexElem.textContent = String(value);
    }
}