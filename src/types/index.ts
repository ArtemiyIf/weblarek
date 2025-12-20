import {categoryMap} from '../utils/constants.ts';

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;

    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export interface TOrderForm {
    payment: string;
    address: string;
    error?: string; // Добавляем необязательное поле
}

export interface TContactsForm {
    email: string;
    phone: string;
    error?: string; // Добавляем необязательное поле
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export type TPayment = 'card' | 'cash';

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export interface IGetProductsApiResponse {
  total: number;
  items: IProduct[]; // именно items, а не data!
}

export interface IOrderApiRequest {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  total: number; // в API-ответе поле называется total, а не totalAmount
  items: string[]; // массив ID товаров (не {productId, quantity})
}

export interface IOrderApiResponse {
  id: string; // в ответе API поле id, а не orderId
  total: number; // возвращаем общую сумму
}

export interface IApiError {
  error: string;
}

export type TCategoryNames = keyof typeof categoryMap;