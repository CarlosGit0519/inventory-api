import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import { createStockMovement, getCurrentStock, listStockMovements } from './stock.controller.js';

export const stockRouter = Router();

stockRouter.use(requireAuth);
stockRouter.get('/movements', listStockMovements);
stockRouter.get('/products/:productId', getCurrentStock);
stockRouter.post('/movements', createStockMovement);
