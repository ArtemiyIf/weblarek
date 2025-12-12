import { IProduct } from '../../types';

export class Basket {
  private _items: IProduct[] = [];

  getItems(): IProduct[] {
    return this._items;
  }addItem(item: IProduct): void {
    if (!this._items.some(i => i.id === item.id)) {
      this._items.push(item);
    }
  }

  removeItem(item: IProduct): void {
    this._items = this._items.filter(i => i.id !== item.id);
  }

  clear(): void {
    this._items = [];
  }

  getTotalPrice(): number {
    return this._items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  getTotalItems(): number {
    return this._items.length;
  }

  hasItem(id: string): boolean {
    return this._items.some(item => item.id === id);
  }
}