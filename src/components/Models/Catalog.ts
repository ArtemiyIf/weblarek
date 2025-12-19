import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';
import {eventNames} from '../../utils/constants.ts';

export class Catalog {
    private _items: IProduct[] = [];
    private _currentItem: IProduct | null = null;
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    setItems(items: IProduct[]): void {
        this._items = items;
        this.events.emit('catalog:changed', this._items);
    }

    getItems(): IProduct[] {
        return this._items;
    }

    getItem(id: string): IProduct | null {
        return this._items.find(item => item.id === id) || null;
    }

    setCurrentItem(item: IProduct): void {
        this._currentItem = item;
        this.events.emit('product:selected', item);
    }

    getCurrentItem(): IProduct | null {
        return this._currentItem;
    }
}