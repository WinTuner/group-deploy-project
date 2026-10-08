const request = require('supertest');
const app = require('../src/index');

describe('auth-service', () => {
  test('UT-AUTH-01: register สร้าง user ใหม่ได้ (201)', async () => {
    const res = await request(app).post('/register').send({ username: 'u' + Date.now(), password: 'pw1234' });
    expect(res.status).toBe(201);
    expect(res.body.username).toBeDefined();
  });
  test('UT-AUTH-02: login ด้วย admin/password123 ได้ token', async () => {
    const res = await request(app).post('/login').send({ username: 'admin', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
  test('UT-AUTH-03: login รหัสผิดต้อง 401', async () => {
    const res = await request(app).post('/login').send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });
  test('UT-AUTH-04: /me ไม่มี token ต้อง 401 + มี token ผ่าน', async () => {
    const noAuth = await request(app).get('/me');
    expect(noAuth.status).toBe(401);
    const login = await request(app).post('/login').send({ username: 'admin', password: 'password123' });
    const me = await request(app).get('/me').set('Authorization', 'Bearer ' + login.body.token);
    expect(me.status).toBe(200);
  });
});
