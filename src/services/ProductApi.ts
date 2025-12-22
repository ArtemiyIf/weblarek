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
    const mockItems = [
        {
            id: '1',
            title: 'Фреймворк куки судьбы',
            price: 2500,
            category: 'софт-скил',
            image: './src/images/Subtract.svg',
            description: 'Фреймворк для работы с куками'
        },
        {
            id: '2',
            title: 'Бэкенд-антистресс',
            price: 1000,
            category: 'другое',
            image: './src/images/Subtract.svg',
            description: 'Если планируете решать задачи в тренажёре, берите два.'
        },
        {
            id: '3',
            title: '+1 час в сутках',
            price: 750,
            category: 'софт-скил',
            image: './src/images/Subtract.svg',
            description: 'Дополнительный час в сутках'
        }
    ];
    
    return {
        items: mockItems,
        total: mockItems.reduce((sum, item) => sum + item.price, 0) // сумма всех цен
    };
}

  // async getProducts(): Promise<IGetProductsApiResponse> {
  //   try {
  //     return await this.api.get<IGetProductsApiResponse>('/product/');
  //   } catch (error) {
  //     // Корректная обработка ошибки без возврата данных
  //     console.error('Ошибка при получении продуктов:', error);
  //     throw error; // Перебрасываем ошибку дальше
  //   }
  // }

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