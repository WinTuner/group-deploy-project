const request = require('supertest');
const app = require('../src/index');

describe('order-service', () => {
  // unit test ไม่พึ่ง product-service ตัวจริง: จำลองว่าต่อไม่ติด (fail-open) ยกเว้นเคสที่ระบุเอง
  beforeEach(() => jest.spyOn(global, 'fetch').mockRejectedValue(new Error('unreachable')));
  afterEach(() => jest.restoreAllMocks());
  test('UT-ORDER-01: POST /orders สร้างออเดอร์ได้', async () => {
    const res = await request(app).post('/orders').send({ productId: 1, qty: 2 });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('created');
  });
  test('UT-ORDER-02: qty <= 0 ต้อง 400', async () => {
    const res = await request(app).post('/orders').send({ productId: 1, qty: 0 });
    expect(res.status).toBe(400);
  });
  test('UT-ORDER-03: PUT /orders/:id แก้ qty และ status ได้', async () => {
    const created = await request(app).post('/orders').send({ productId: 1, qty: 1 });
    const res = await request(app).put(`/orders/${created.body.id}`).send({ qty: 5, status: 'paid' });
    expect(res.status).toBe(200);
    expect(res.body.qty).toBe(5);
    expect(res.body.status).toBe('paid');
  });
  test('UT-ORDER-04: DELETE /orders/:id ลบแล้วหาไม่เจอ (404)', async () => {
    const created = await request(app).post('/orders').send({ productId: 2, qty: 1 });
    const del = await request(app).delete(`/orders/${created.body.id}`);
    expect(del.status).toBe(204);
    const res = await request(app).get(`/orders/${created.body.id}`);
    expect(res.status).toBe(404);
  });
  test('UT-ORDER-05: สินค้าไม่มีจริง (product-service ตอบ 404) ต้องถูกปฏิเสธ 400', async () => {
    global.fetch.mockResolvedValue({ status: 404 });
    const res = await request(app).post('/orders').send({ productId: 999, qty: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('product not found');
  });
});
