import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';

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
            this.events.emit('basket:changed', this._items);
        }
    }

    removeItem(id: string): void {
        this._items = this._items.filter(item => item.id !== id);
        this.events.emit('basket:changed', this._items);
    }

    clear(): void {
        this._items = [];
        this.events.emit('basket:changed', this._items);
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