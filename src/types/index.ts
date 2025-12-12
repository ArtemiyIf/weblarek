export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
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
  success: boolean;
  data: IProduct[];
  total: number;
  message?: string;
}

export interface IOrderApiRequest {
  buyer: IBuyer;
  items: IProduct[];
  totalAmount: number;
}

export interface IOrderApiResponse {
  success: boolean;
  orderId?: string;
  status: 'created' | 'confirmed' | 'failed';
  message: string;
}

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: 'POST' | 'PUT' | 'DELETE'
  ): Promise<T>;
}

