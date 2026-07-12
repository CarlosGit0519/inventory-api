import express from 'express';

import { errorHandler } from './middlewares/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { categoryRouter } from './modules/categories/category.routes.js';
import { productRouter } from './modules/products/product.routes.js';
import { stockRouter } from './modules/stock/stock.routes.js';

export const app = express();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/stock', stockRouter);

app.use(errorHandler);
