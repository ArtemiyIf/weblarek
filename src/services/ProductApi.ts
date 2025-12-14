import {
  IApi,
  IGetProductsApiResponse,
  IOrderApiRequest,
  IOrderApiResponse,
  IApiError
} from '../types';

export class ProductApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  async getProducts(): Promise<IGetProductsApiResponse> {
    try {
      return await this.api.get<IGetProductsApiResponse>('/product/');
    } catch (error) {
      // Корректная обработка ошибки без возврата данных
      console.error('Ошибка при получении продуктов:', error);
      throw error; // Перебрасываем ошибку дальше
    }
  }

  async order(
    data: IOrderApiRequest
  ): Promise<IOrderApiResponse | IApiError> {
    try {
      const response = await this.api.post<IOrderApiResponse>(
        '/order',
        data,
        'POST'
      );
      return response;
    } catch (error) {
      if (error instanceof Response) {
        try {
          const json = await error.json();
          if (typeof json.error === 'string') {
            return { error: json.error };  
          }
        } catch (jsonError) {
          return { error: 'Не удалось обработать ответ сервера' };
        }
      }
      return {
        error: 'Неизвестная ошибка при отправке заказа'
      };
    }
  }
}