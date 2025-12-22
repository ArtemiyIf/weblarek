import { Card } from '../Card/Card';
import { CDN_URL } from '../../../utils/constants';
import { IProduct, TCategoryNames } from '../../../types';
import { ensureElement } from '../../../utils/utils';

type TCardCatalogActions = {
    onClick?: (event: MouseEvent) => void;
};

export class CardCatalog extends Card<IProduct> {
    protected categoryElem: HTMLElement;
    protected imageElem: HTMLImageElement;

    constructor(container: HTMLElement, actions?: TCardCatalogActions) {
        super(container);
        
        this.categoryElem = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElem = ensureElement<HTMLImageElement>('.card__image', this.container);

        if (actions?.onClick) {
            this.container.addEventListener('click', actions.onClick);
        }
    }

    set category(value: TCategoryNames) {
        const modifier = Card.getCategoryClassByCategoryName(value);
        this.categoryElem.textContent = value;
        this.categoryElem.className = `card__category ${modifier}`; 
    }

    set image(value: string) {
    console.log('Setting image:', `${CDN_URL}${value}`); // Для отладки
    this.setImage(this.imageElem, `${CDN_URL}${value}`);
}
}