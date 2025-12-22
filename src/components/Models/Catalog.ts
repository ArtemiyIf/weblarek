import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';
import { eventNames } from '../../utils/constants';

export class Catalog {
    private _items: IProduct[] = [];
    private _currentItem: IProduct | null = null;
    
    constructor(private events: EventEmitter) {}

    setItems(items: IProduct[]): void {
        this._items = items;
        this.events.emit(eventNames.CATALOG_SET_ITEMS, this._items);
    }

    getItems(): IProduct[] {
        return this._items;
    }

    setCurrentItem(item: IProduct): void {
        this._currentItem = item;
        this.events.emit(eventNames.CATALOG_SET_CURRENT_ITEM, this._currentItem);
    }

    getCurrentItem(): IProduct | null {
        return this._currentItem;
    }
}