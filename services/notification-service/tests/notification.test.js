const request = require('supertest');
const app = require('../src/index');

describe('notification-service', () => {
  test('UT-NOTI-01: POST /notifications ส่งได้', async () => {
    const res = await request(app).post('/notifications').send({ to: 'admin', message: 'hello' });
    expect(res.status).toBe(201);
    expect(res.body.sentAt).toBeDefined();
  });
  test('UT-NOTI-02: ขาด message ต้อง 400', async () => {
    const res = await request(app).post('/notifications').send({ to: 'admin' });
    expect(res.status).toBe(400);
  });
});
