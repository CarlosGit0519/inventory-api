import { z } from 'zod';

export const productIdSchema = z.object({
  productId: z.string().cuid(),
});

export const createStockMovementSchema = z.object({
  productId: z.string().cuid(),
  type: z.enum(['IN', 'OUT']),
  quantity: z.coerce.number().int().positive(),
  note: z.string().trim().min(1).max(500).optional(),
});

export const stockMovementListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().cuid().optional(),
  type: z.enum(['IN', 'OUT']).optional(),
});
