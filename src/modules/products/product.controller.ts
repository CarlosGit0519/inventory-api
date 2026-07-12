import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../errors/app-error.js';
import {
  createProductSchema,
  productIdSchema,
  productListQuerySchema,
  updateProductSchema,
} from './product.validation.js';

async function ensureUsableCategory(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(404, 'Category not found.');
  }

  if (!category.isActive) {
    throw new AppError(400, 'Category is inactive.');
  }
}

async function ensureAvailableSku(sku: string, productId?: string): Promise<void> {
  const product = await prisma.product.findUnique({ where: { sku } });

  if (product && product.id !== productId) {
    throw new AppError(409, 'SKU is already registered.');
  }
}

export async function createProduct(request: Request, response: Response): Promise<void> {
  const input = createProductSchema.parse(request.body);

  await ensureUsableCategory(input.categoryId);
  await ensureAvailableSku(input.sku);

  const product = await prisma.product.create({
    data: {
      sku: input.sku,
      name: input.name,
      ...(input.description !== undefined ? { description: input.description } : {}),
      price: input.price,
      categoryId: input.categoryId,
    },
    include: { category: true },
  });

  response.status(201).json({ data: { product } });
}

export async function listProducts(request: Request, response: Response): Promise<void> {
  const { page, limit, search, categoryId } = productListQuerySchema.parse(request.query);
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  response.json({
    data: { products },
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getProduct(request: Request, response: Response): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw new AppError(404, 'Product not found.');
  }

  response.json({ data: { product } });
}

export async function updateProduct(request: Request, response: Response): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  const input = updateProductSchema.parse(request.body);
  const existingProduct = await prisma.product.findUnique({ where: { id } });

  if (!existingProduct) {
    throw new AppError(404, 'Product not found.');
  }

  if (input.categoryId) {
    await ensureUsableCategory(input.categoryId);
  }

  if (input.sku) {
    await ensureAvailableSku(input.sku, id);
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.sku !== undefined ? { sku: input.sku } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
    },
    include: { category: true },
  });

  response.json({ data: { product } });
}

export async function deactivateProduct(request: Request, response: Response): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  const existingProduct = await prisma.product.findUnique({ where: { id } });

  if (!existingProduct) {
    throw new AppError(404, 'Product not found.');
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: { category: true },
  });

  response.json({ data: { product } });
}
