import type { Request, Response } from 'express';

import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  createStockMovementSchema,
  productIdSchema,
  stockMovementListQuerySchema,
} from './stock.validation.js';

async function calculateCurrentStock(
  client: Prisma.TransactionClient,
  productId: string,
): Promise<number> {
  const inbound = await client.stockMovement.aggregate({
    where: { productId, type: 'IN' },
    _sum: { quantity: true },
  });
  const outbound = await client.stockMovement.aggregate({
    where: { productId, type: 'OUT' },
    _sum: { quantity: true },
  });

  return (inbound._sum.quantity ?? 0) - (outbound._sum.quantity ?? 0);
}

export async function createStockMovement(request: Request, response: Response): Promise<void> {
  const input = createStockMovementSchema.parse(request.body);

  if (!request.auth) {
    throw new AppError(401, 'Authentication is required.');
  }

  const userId = request.auth.userId;

  const result = await prisma.$transaction(
    async (transaction) => {
      const product = await transaction.product.findUnique({ where: { id: input.productId } });

      if (!product) {
        throw new AppError(404, 'Product not found.');
      }

      if (!product.isActive) {
        throw new AppError(400, 'Cannot create movements for an inactive product.');
      }

      const currentStock = await calculateCurrentStock(transaction, input.productId);

      if (input.type === 'OUT' && currentStock < input.quantity) {
        throw new AppError(400, 'Insufficient stock for this outgoing movement.');
      }

      const movement = await transaction.stockMovement.create({
        data: {
          productId: input.productId,
          userId,
          type: input.type,
          quantity: input.quantity,
          ...(input.note !== undefined ? { note: input.note } : {}),
        },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return { movement, currentStock: currentStock + (input.type === 'IN' ? input.quantity : -input.quantity) };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  response.status(201).json({ data: result });
}

export async function listStockMovements(request: Request, response: Response): Promise<void> {
  const { page, limit, productId, type } = stockMovementListQuerySchema.parse(request.query);
  const where: Prisma.StockMovementWhereInput = {
    ...(productId !== undefined ? { productId } : {}),
    ...(type !== undefined ? { type } : {}),
  };

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, sku: true, name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  response.json({
    data: { movements },
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getCurrentStock(request: Request, response: Response): Promise<void> {
  const { productId } = productIdSchema.parse(request.params);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, sku: true, name: true, isActive: true },
  });

  if (!product) {
    throw new AppError(404, 'Product not found.');
  }

  const currentStock = await calculateCurrentStock(prisma, productId);
  response.json({ data: { product, currentStock } });
}
