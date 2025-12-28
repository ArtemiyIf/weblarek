import { EventEmitter } from '../base/Events';
import { IProduct } from '../../types';

export class Basket {
    private items: IProduct[] = [];
    private total: number = 0;
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    render(): { items: IProduct[], total: number } {
        return {
            items: [...this.items],
            total: this.total
        };
    }

    getItems(): IProduct[] {
        return [...this.items];
    }

    getTotalPrice(): number {
        return this.total;
    }

    getTotalItems(): number {
        return this.items.length;
    }

    hasItem(id: string): boolean {
        return this.items.some(item => item.id === id);
    }

    addItem(item: IProduct): void {
        this.items.push(item);
        this.updateTotal();
        this.events.emit('basket:change');
    }

    removeItem(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
        this.updateTotal();
        this.events.emit('basket:change');
    }

    clear(): void {
        this.items = [];
        this.total = 0;
        this.events.emit('basket:change');
    }

    private updateTotal(): void {
        this.total = this.calculateTotal();
    }

    private calculateTotal(): number {
        return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }
}