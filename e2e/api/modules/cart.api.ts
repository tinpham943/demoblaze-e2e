import { randomUUID } from 'node:crypto';
import type { RestClient } from '@e2e/api/client';
import { API_ROUTES } from '@e2e/config/routes';
import {
  DeletedSchema,
  EmptyBodySchema,
  ViewCartResponseSchema,
  type CartLine,
} from '@e2e/types/schemas/cart.schema';

/** The cart of a signed-in user, addressed by its session token (`flag: true` = signed-in cart). */
export class CartApi {
  constructor(private readonly client: RestClient) {}

  async add(token: string, productId: number): Promise<void> {
    await this.client.post(API_ROUTES.addToCart, EmptyBodySchema, {
      id: randomUUID(),
      cookie: token,
      prod_id: productId,
      flag: true,
    });
  }

  /** The cart lines; throws with the API's reason when the token is refused. */
  async view(token: string): Promise<CartLine[]> {
    const body = await this.client.post(API_ROUTES.viewCart, ViewCartResponseSchema, {
      cookie: token,
      flag: true,
    });
    if ('errorMessage' in body) throw new Error(`View cart refused: ${body.errorMessage}`);
    return body.Items;
  }

  /** Keyed by username, not token. */
  async clear(username: string): Promise<void> {
    await this.client.post(API_ROUTES.deleteCart, DeletedSchema, { cookie: username });
  }
}
