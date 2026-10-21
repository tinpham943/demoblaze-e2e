import type { RestClient } from '@e2e/api/client';
import { API_ROUTES } from '@e2e/config/routes';
import { ProductListSchema, type Product } from '@e2e/types/schemas/product.schema';

export class ProductApi {
  constructor(private readonly client: RestClient) {}

  /** The first catalogue page — the products the home page shows on load. */
  async firstPage(): Promise<Product[]> {
    return (await this.client.get(API_ROUTES.entries, ProductListSchema)).Items;
  }
}
