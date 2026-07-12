import { Router } from 'express';

import { requireAuth } from '../../middlewares/require-auth.js';
import { getCurrentUser, login, registerInitialAdmin } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', registerInitialAdmin);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, getCurrentUser);
