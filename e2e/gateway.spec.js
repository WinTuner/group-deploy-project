// E2E-01: ยิงผ่าน nginx gateway ทางเดียว (ไม่ยิงตรง :300x)
const { test, expect } = require('@playwright/test');

const services = [
  ['auth', 'auth-service'],
  ['products', 'product-service'],
  ['orders', 'order-service'],
  ['notifications', 'notification-service'],
  ['cart', 'cart-service'],
];

test('gateway /health ตอบ ok', async ({ request }) => {
  const r = await request.get('/health');
  expect(r.ok()).toBeTruthy();
  expect((await r.json()).gateway).toBe('nginx');
});

for (const [path, name] of services) {
  test(`/api/${path}/health -> ${name} ok`, async ({ request }) => {
    const r = await request.get(`/api/${path}/health`);
    expect(r.ok()).toBeTruthy();
    expect((await r.json()).service).toBe(name);
  });
}

test('login ผ่าน gateway ได้ JWT', async ({ request }) => {
  const r = await request.post('/api/auth/login', {
    data: { username: 'admin', password: 'password123' },
  });
  expect(r.ok()).toBeTruthy();
  expect((await r.json()).token).toBeDefined();
});

test('login รหัสผิดผ่าน gateway ได้ 401', async ({ request }) => {
  const r = await request.post('/api/auth/login', {
    data: { username: 'admin', password: 'wrong' },
  });
  expect(r.status()).toBe(401);
});

test('order-service เช็ค product-service: สินค้าไม่มีจริงต้อง 400', async ({ request }) => {
  const r = await request.post('/api/orders/orders', {
    data: { productId: 999999, qty: 1 },
  });
  expect(r.status()).toBe(400);
  expect((await r.json()).error).toBe('product not found');
});

test('CRUD สินค้าผ่าน gateway', async ({ request }) => {
  const created = await request.post('/api/products/products', {
    data: { name: 'E2E-Monitor', price: 4990 },
  });
  expect(created.status()).toBe(201);
  const list = await request.get('/api/products/products');
  expect(await list.json()).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'E2E-Monitor' })]));
});
