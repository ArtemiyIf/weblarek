import {IProduct, TCategoryNames} from '../../../types';
import {ensureElement} from '../../../utils/utils.ts';
import {Card} from './Card.ts';
import {CDN_URL} from '../../../utils/constants.ts';

type TCardPreviewData = {
    canBuy: boolean,
    buttonText: string,
} & Pick<IProduct, 'description' | 'price' | 'image' | 'category'>;
type TCardPreviewActions = {
    onClick?: () => void;
};

export class CardPreview extends Card<TCardPreviewData> {
    protected readonly descriptionElement: HTMLParagraphElement;
    protected readonly buttonElement: HTMLButtonElement;
    protected readonly categoryElem: HTMLElement;
    protected readonly imageElem: HTMLImageElement;

    constructor(
        protected readonly container: HTMLElement,
        protected readonly actions?: TCardPreviewActions,
    ) {
        super(container);

        this.descriptionElement = ensureElement<HTMLParagraphElement>('.card__text', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);
        this.categoryElem = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElem = ensureElement<HTMLImageElement>('.card__image', this.container);

        if (this.actions?.onClick) {
            this.buttonElement.addEventListener('click', this.actions.onClick);
        }
    }

    set category(category: TCategoryNames) {
        const categoryClassModifier = Card.getCategoryClassByCategoryName(category);

        this.categoryElem.textContent = category;
        this.categoryElem.className = `card__category ${categoryClassModifier}`;
    }

    set canBuy(canBuy: boolean) {
        this.buttonElement.disabled = !canBuy;
    }

    set buttonText(buttonText: string) {
        this.buttonElement.textContent = buttonText;
    }

    set description(description: string) {
        this.descriptionElement.textContent = description;
    }
    set image(imageSrc: string) {
        this.setImage(this.imageElem, CDN_URL + imageSrc);
    }
}