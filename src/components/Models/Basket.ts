import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';
import { eventNames } from '../../utils/constants';

export class Basket {
    private _items: IProduct[] = [];
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    getItems(): IProduct[] {
        return this._items;
    }

    addItem(item: IProduct): void {
        if (!this.hasItem(item.id)) {
            this._items.push(item);
            this.events.emit(eventNames.BASKET_ADD_ITEM, { item });
        }
    }

    removeItem(id: string): void {
        const removedItem = this._items.find(item => item.id === id);
        this._items = this._items.filter(item => item.id !== id);
        
        // 🔧 Передаём объект с id или удалённым товаром
        if (removedItem) {
            this.events.emit(eventNames.BASKET_DELETE_ITEM, { 
                id, 
                item: removedItem 
            });
        } else {
            this.events.emit(eventNames.BASKET_DELETE_ITEM, { id });
        }
    }

    clear(): void {
        const items = [...this._items];
        this._items = [];
        this.events.emit(eventNames.BASKET_CLEAR, { items });
    }

    getTotalPrice(): number {
        return this._items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    getTotalItems(): number {
        return this._items.length;
    }

    hasItem(id: string): boolean {
        return this._items.some(item => item.id === id);
    }
}