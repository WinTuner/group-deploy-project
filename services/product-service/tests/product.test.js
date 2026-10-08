const request = require('supertest');
const app = require('../src/index');

describe('product-service', () => {
  test('UT-PROD-01: GET /products คืน array', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('UT-PROD-02: POST /products สร้างสินค้าได้', async () => {
    const res = await request(app).post('/products').send({ name: 'Monitor', price: 4990 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
