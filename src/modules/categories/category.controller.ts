import type { Request, Response } from 'express';

import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from './category.validation.js';

export async function createCategory(request: Request, response: Response): Promise<void> {
  const input = createCategorySchema.parse(request.body);
  const existing = await prisma.category.findUnique({ where: { name: input.name } });

  if (existing) throw new AppError(409, 'Category name is already in use.');

  const category = await prisma.category.create({ data: input });
  response.status(201).json({ data: { category } });
}

export async function listCategories(_request: Request, response: Response): Promise<void> {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  response.status(200).json({ data: { categories } });
}

export async function updateCategory(request: Request, response: Response): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);
  const input = updateCategorySchema.parse(request.body);
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) throw new AppError(404, 'Category not found.');

  const sameName = await prisma.category.findUnique({ where: { name: input.name } });
  if (sameName && sameName.id !== id) throw new AppError(409, 'Category name is already in use.');

  const updatedCategory = await prisma.category.update({ where: { id }, data: input });
  response.status(200).json({ data: { category: updatedCategory } });
}

export async function deactivateCategory(request: Request, response: Response): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) throw new AppError(404, 'Category not found.');

  const updatedCategory = await prisma.category.update({ where: { id }, data: { isActive: false } });
  response.status(200).json({ data: { category: updatedCategory } });
}
