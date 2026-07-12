import { Router } from 'express';

import { requireAuth, requireRole } from '../../middlewares/require-auth.js';
import { createCategory, deactivateCategory, listCategories, updateCategory } from './category.controller.js';

export const categoryRouter = Router();

categoryRouter.use(requireAuth);
categoryRouter.get('/', listCategories);
categoryRouter.post('/', requireRole('ADMIN'), createCategory);
categoryRouter.patch('/:id', requireRole('ADMIN'), updateCategory);
categoryRouter.patch('/:id/deactivate', requireRole('ADMIN'), deactivateCategory);
