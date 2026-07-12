import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { loginSchema, registerSchema } from './auth.validation.js';

function createAccessToken(user: { id: string; role: 'ADMIN' | 'STAFF' }): string {
  const signOptions: SignOptions = {
    expiresIn: env.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
  };

  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, signOptions);
}

export async function registerInitialAdmin(request: Request, response: Response): Promise<void> {
  const input = registerSchema.parse(request.body);
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    throw new AppError(403, 'Initial administrator has already been created.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  response.status(201).json({
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
}

export async function login(request: Request, response: Response): Promise<void> {
  const input = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password.');
  }

  response.status(200).json({
    data: {
      accessToken: createAccessToken(user),
      tokenType: 'Bearer',
    },
  });
}

export async function getCurrentUser(request: Request, response: Response): Promise<void> {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Authentication token is required.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(401, 'User associated with this token no longer exists.');
  }

  response.status(200).json({
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
}
