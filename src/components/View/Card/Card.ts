import { Component } from '../../base/Component';
import {categoryMap} from '../../../utils/constants.ts';
import { IProduct, TCategoryNames } from '../../../types';

type TCardData = Pick<IProduct, 'title' | 'price'>;

export abstract class Card<T> extends Component<TCardData & T> {
    protected titleElem: HTMLElement;
    protected priceElem: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.titleElem = container.querySelector('.card__title')!;
        this.priceElem = container.querySelector('.card__price')!;
    }

    set title(value: string) {
        this.titleElem.textContent = value;
    }

    set price(value: number | null) {
    if (value === null) {
        this.priceElem.textContent = 'Бесценно';
    } else {
        this.priceElem.textContent = `${value} синапсов`; // Исправлено
    }
}

     static getCategoryClassByCategoryName(categoryName: TCategoryNames): string {
        return categoryMap[categoryName];
    }
}