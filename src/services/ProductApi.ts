import { Api } from '../components/base/Api';
import { IGetProductsApiResponse, IOrderApiRequest, IOrderApiResponse, IApiError } from '../types';

export class ProductApi {
    constructor(private api: Api) {}

    async getProducts(): Promise<IGetProductsApiResponse> {
        return await this.api.get('/product/');
    }

    async order(data: IOrderApiRequest): Promise<IOrderApiResponse | IApiError> {
        return await this.api.post('/order', data);
    }
}