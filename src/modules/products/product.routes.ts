import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/require-auth.js';
import {
  createProduct,
  deactivateProduct,
  getProduct,
  listProducts,
  updateProduct,
} from './product.controller.js';

export const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get('/', listProducts);
productRouter.get('/:id', getProduct);
productRouter.post('/', requireRole('ADMIN'), createProduct);
productRouter.patch('/:id', requireRole('ADMIN'), updateProduct);
productRouter.patch('/:id/deactivate', requireRole('ADMIN'), deactivateProduct);
