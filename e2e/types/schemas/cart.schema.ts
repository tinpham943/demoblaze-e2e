import { z } from 'zod';
import { ApiErrorBodySchema } from '@e2e/types/schemas/auth.schema';

/** `/addtocart` answers with an empty body. */
export const EmptyBodySchema = z.null();

/** `/deletecart`. */
export const DeletedSchema = z.literal('Item deleted.');

/** One cart line. `cookie` is the owner's username for a signed-in cart. */
export const CartLineSchema = z.object({
  id: z.string().min(1),
  cookie: z.string().min(1),
  prod_id: z.number().int().positive(),
});
export type CartLine = z.infer<typeof CartLineSchema>;

/** `/viewcart`: the lines, or `{ errorMessage }` for a bad token. */
export const ViewCartResponseSchema = z.union([
  z.object({ Items: z.array(CartLineSchema) }),
  ApiErrorBodySchema,
]);
