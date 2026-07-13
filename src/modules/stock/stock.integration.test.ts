import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../app.js';
import { prisma } from '../../lib/prisma.js';

const testId = `test-${Date.now()}`;
const testEmail = `${testId}@example.com`;
const testSku = `TEST-${Date.now()}`;
let userId: string;
let categoryId: string;
let productId: string;
let accessToken: string;

beforeAll(async () => {
  await prisma.$connect();

  const passwordHash = await bcrypt.hash('SafePassword123!', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Stock Test User',
      email: testEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });
  userId = user.id;

  const category = await prisma.category.create({
    data: { name: `Test category ${testId}` },
  });
  categoryId = category.id;

  const product = await prisma.product.create({
    data: {
      sku: testSku,
      name: 'Stock test product',
      price: 10,
      categoryId,
    },
  });
  productId = product.id;

  const loginResponse = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: testEmail, password: 'SafePassword123!' });

  accessToken = loginResponse.body.data.accessToken;
});

afterAll(async () => {
  if (productId) {
    await prisma.stockMovement.deleteMany({ where: { productId } });
    await prisma.product.deleteMany({ where: { id: productId } });
  }

  if (categoryId) {
    await prisma.category.deleteMany({ where: { id: categoryId } });
  }

  if (userId) {
    await prisma.user.deleteMany({ where: { id: userId } });
  }

  await prisma.$disconnect();
});

describe('stock movements', () => {
  it('records an incoming movement', async () => {
    const response = await request(app)
      .post('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        productId,
        type: 'IN',
        quantity: 10,
        note: 'Initial stock for automated test',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.currentStock).toBe(10);
    expect(response.body.data.movement.type).toBe('IN');
  });

  it('records an outgoing movement when stock is available', async () => {
    const response = await request(app)
      .post('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        productId,
        type: 'OUT',
        quantity: 3,
        note: 'Sale for automated test',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.currentStock).toBe(7);
    expect(response.body.data.movement.type).toBe('OUT');
  });

  it('prevents an outgoing movement that would make stock negative', async () => {
    const response = await request(app)
      .post('/api/v1/stock/movements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        productId,
        type: 'OUT',
        quantity: 8,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Insufficient stock for this outgoing movement.');
  });

  it('returns the calculated current stock', async () => {
    const response = await request(app)
      .get(`/api/v1/stock/products/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.currentStock).toBe(7);
  });
});
