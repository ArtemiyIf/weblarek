import { Card } from '../Card/Card';
import { CDN_URL } from '../../../utils/constants';
import {IProduct, TCategoryNames } from '../../../types';
import { ensureElement } from '../../../utils/utils';

type TCardCatalogActions = {
    onClick?: (id: string) => void;
};

type TCardCatalog = Pick<IProduct, 'image' | 'category'>;

export class CardCatalog extends Card<TCardCatalog> {
    protected categoryElem: HTMLElement;
    protected imageElem: HTMLImageElement;

    constructor(
        container: HTMLElement,
        protected actions?: TCardCatalogActions
    ) {
        super(container);

        this.categoryElem = ensureElement<HTMLElement>(
            '.card__category',
            this.container
        );
        this.imageElem = ensureElement<HTMLImageElement>(
            '.card__image',
            this.container
        );

        // Обработчик клика — передаём id товара
        this.container.addEventListener('click', () => {
            if (this.actions?.onClick) {
                this.actions.onClick(this.getId());
            }
        });
    }

    set category(category: TCategoryNames) {
        const modifier = Card.getCategoryClassByCategoryName(category);
        this.categoryElem.textContent = category;
        this.categoryElem.className = `card_category ${modifier}`;
    }

    set image(imageSrc: string) {
        this.setImage(this.imageElem, `${CDN_URL}${imageSrc}`);
    }
}