import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  try {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication token is required.');
    }

    const token = authorization.slice('Bearer '.length);
    const payload = jwt.verify(token, env.jwtSecret);

    if (
      typeof payload === 'string' ||
      !payload.sub ||
      (payload.role !== 'ADMIN' && payload.role !== 'STAFF')
    ) {
      throw new AppError(401, 'Invalid access token.');
    }

    request.auth = {
      userId: payload.sub,
      role: payload.role,
    };
    next();
  } catch (error: unknown) {
    next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired access token.'));
  }
}

export function requireRole(...allowedRoles: Array<'ADMIN' | 'STAFF'>) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.auth || !allowedRoles.includes(request.auth.role)) {
      next(new AppError(403, 'You do not have permission to perform this action.'));
      return;
    }

    next();
  };
}
