import { IProduct } from '../../types';

export class Catalog {
  private _items: IProduct[] = [];
  private _currentItem: IProduct | null = null;

  setItems(items: IProduct[]): void {
    this._items = items;
  }

  getItems(): IProduct[] {
    return this._items;
  }

  getItem(id: string): IProduct | null {
    return this._items.find(item => item.id === id) || null;
  }

  setCurrentItem(item: IProduct): void {
    this._currentItem = item;
  }

  getCurrentItem(): IProduct | null {
    return this._currentItem;
  }
}