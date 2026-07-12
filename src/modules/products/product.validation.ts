import { z } from 'zod';

export const productIdSchema = z.object({
  id: z.string().cuid(),
});

export const createProductSchema = z.object({
  sku: z.string().trim().min(2).max(50).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional(),
  price: z.coerce.number().positive(),
  categoryId: z.string().cuid(),
});

export const updateProductSchema = createProductSchema.partial();

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  categoryId: z.string().cuid().optional(),
});
