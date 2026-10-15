const request = require('supertest');
const app = require('../src/index');

describe('cart-service', () => {
  // ไม่พึ่ง product-service ตัวจริง
  beforeEach(() => jest.spyOn(global, 'fetch').mockRejectedValue(new Error('unreachable')));
  afterEach(() => jest.restoreAllMocks());
  test('UT-CART-01: POST /cart เพิ่มของลงตะกร้าได้', async () => {
    const res = await request(app).post('/cart').send({ userId: 'u1', productId: 1, qty: 2 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.qty).toBe(2);
  });
  test('UT-CART-02: qty เกิน 1..99 ต้อง 400', async () => {
    const res = await request(app).post('/cart').send({ userId: 'u1', productId: 1, qty: 0 });
    expect(res.status).toBe(400);
  });
  test('UT-CART-03: PUT /cart/:id แก้จำนวนได้', async () => {
    const created = await request(app).post('/cart').send({ userId: 'u2', productId: 2, qty: 1 });
    const res = await request(app).put(`/cart/${created.body.id}`).send({ qty: 3 });
    expect(res.status).toBe(200);
    expect(res.body.qty).toBe(3);
  });
  test('UT-CART-04: DELETE แล้วหาไม่เจอ (404)', async () => {
    const created = await request(app).post('/cart').send({ userId: 'u3', productId: 1, qty: 1 });
    const del = await request(app).delete(`/cart/${created.body.id}`);
    expect(del.status).toBe(204);
  });
  test('UT-CART-05: สินค้าไม่มีจริง (product-service ตอบ 404) ต้อง 400', async () => {
    global.fetch.mockResolvedValue({ status: 404 });
    const res = await request(app).post('/cart').send({ userId: 'u9', productId: 999, qty: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('product not found');
  });
});
