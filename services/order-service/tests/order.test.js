const request = require('supertest');
const app = require('../src/index');

describe('order-service', () => {
  test('UT-ORDER-01: POST /orders สร้างออเดอร์ได้', async () => {
    const res = await request(app).post('/orders').send({ productId: 1, qty: 2 });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('created');
  });
  test('UT-ORDER-02: qty <= 0 ต้อง 400', async () => {
    const res = await request(app).post('/orders').send({ productId: 1, qty: 0 });
    expect(res.status).toBe(400);
  });
});
