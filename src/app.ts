import express from 'express';

import { errorHandler } from './middlewares/error-handler.js';

export const app = express();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use(errorHandler);
