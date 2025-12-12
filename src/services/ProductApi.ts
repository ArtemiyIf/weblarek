import {IApi, IGetProductsApiResponse, IOrderApiRequest, IOrderApiResponse} from '../types';

export class ProductApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  async getProducts(): Promise<IGetProductsApiResponse> {
    try {
      const response = await this.api.get<IGetProductsApiResponse>('/product/');
      return response;
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Ошибка загрузки товаров'
      };
    }
  }

  async order(data: IOrderApiRequest): Promise<IOrderApiResponse> {
    try {
      const response = await this.api.post<IOrderApiResponse>(
        '/order/',
        data,
        'POST'
      );
      return response;
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: error instanceof Error
          ? `Ошибка отправки заказа: ${error.message}`
          : 'Неизвестная ошибка при отправке заказа'
      };
    }
  }
}