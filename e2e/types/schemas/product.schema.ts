import { z } from 'zod';
import { CATEGORIES } from '@e2e/types/domain';

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().positive(),
  cat: z.enum(CATEGORIES),
  img: z.string().min(1),
  desc: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

/** `/entries`. */
export const ProductListSchema = z.object({ Items: z.array(ProductSchema) });
