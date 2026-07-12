import { z } from 'zod';

export const categoryIdSchema = z.object({ id: z.string().cuid() });
export const createCategorySchema = z.object({ name: z.string().trim().min(2).max(100) });
export const updateCategorySchema = createCategorySchema;
