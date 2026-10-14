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
    expect(res.body.name).toBe('Monitor');
  });

  test('POST /products validation error เมื่อข้อมูลไม่ครบ', async () => {
    const res = await request(app).post('/products').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /products/:id ดึงสินค้าตาม id สำเร็จ', async () => {
    const res = await request(app).get('/products/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Keyboard');
  });

  test('GET /products/:id คืน 404 เมื่อไม่พบสินค้า', async () => {
    const res = await request(app).get('/products/999');
    expect(res.status).toBe(404);
  });

  test('PUT /products/:id อัปเดตสินค้าได้', async () => {
    const res = await request(app).put('/products/1').send({ price: 1190 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1190);
  });

  test('PUT /products/:id คืน 404 เมื่อไม่พบสินค้า', async () => {
    const res = await request(app).put('/products/999').send({ name: 'None' });
    expect(res.status).toBe(404);
  });

  test('DELETE /products/:id ลบสินค้าได้', async () => {
    const res = await request(app).delete('/products/2');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('deleted');
  });

  test('DELETE /products/:id คืน 404 เมื่อไม่พบสินค้า', async () => {
    const res = await request(app).delete('/products/999');
    expect(res.status).toBe(404);
  });

  test('GET /health ตรวจสอบสถานะการทำงาน', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('product-service');
  });
});

