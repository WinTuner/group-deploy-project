# Test Specification (PM ออกแบบ — ครบ 5 คน, Unit Test 25 เคส ≥ 5)

## สรุป
- Framework: **Jest + Supertest** (รันบน CI ทุก PR/push, fail แล้วบล็อก build-push)
- รวม 25 Unit Tests (เกินขั้นต่ำ 5): auth 4, product 10, order 5, noti 2, cart 4
- Tester (คนที่ 4) เป็นเจ้าของไฟล์นี้ + สั่งรันบน pipeline

## Test Cases
| ID | Owner | Service | Case | Input | Expected |
|----|-------|---------|------|-------|----------|
| UT-AUTH-01 | Dev (5) | auth | register สร้าง user ใหม่ | POST /register {u,p} | 201 + username |
| UT-AUTH-02 | Dev (5) | auth | login สำเร็จได้ JWT | POST /login admin/password123 | 200 + token |
| UT-AUTH-03 | Dev (5) | auth | login รหัสผิด | POST /login admin/wrong | 401 |
| UT-AUTH-04 | Dev (5) | auth | /me ต้องใช้ Bearer token | GET /me ไม่มี/มี token | 401 / 200 |
| UT-PROD-01 | Dev (2) | product | list สินค้า | GET /products | 200 array |
| UT-PROD-02 | Dev (2) | product | สร้างสินค้า | POST /products {Monitor,4990} | 201 + id |
| UT-ORDER-01 | Dev (3) | order | สร้างออเดอร์ | POST /orders {1,2} | 201 status=created |
| UT-ORDER-02 | Dev (3) | order | qty<=0 ถูกปฏิเสธ | POST /orders {1,0} | 400 |
| UT-ORDER-03 | Dev (3) | order | แก้ qty/status ออเดอร์ | PUT /orders/:id | 200 |
| UT-ORDER-04 | Dev (3) | order | ลบออเดอร์ | DELETE /orders/:id | 204 → GET 404 |
| UT-ORDER-05 | Dev (3) | order | สินค้าไม่มีจริงถูกปฏิเสธ (เช็ค product-service) | POST /orders {999,1} | 400 product not found |
| UT-NOTI-01 | Tester (4) | noti | ส่งแจ้งเตือน | POST /notifications {to,msg} | 201 + sentAt |
| UT-NOTI-02 | Tester (4) | noti | ขาด message ถูกปฏิเสธ | POST /notifications {to} | 400 |
| UT-CART-01 | PM (1) | cart | เพิ่มของลงตะกร้า | POST /cart {u1,1,2} | 201 + id |
| UT-CART-02 | PM (1) | cart | qty นอก 1..99 ถูกปฏิเสธ | POST /cart {u1,1,0} | 400 |
| UT-CART-03 | PM (1) | cart | แก้จำนวนในตะกร้า | PUT /cart/:id {qty:3} | 200 qty=3 |
| UT-CART-04 | PM (1) | cart | ลบของออกจากตะกร้า | DELETE /cart/:id | 204 |

## Integration / E2E (Tester รันเสริม, ไม่บังคับนับโควต้า)
- IT-01 (Frontend คนที่ 5): เปิด `:8080` → กรอก admin/password123 → ได้ token โชว์สีเขียว
- IT-02: `docker compose up --build` → `curl :3001/health :3002/health :3003/health :3004/health :3005/health` ต้อง `{"status":"ok"}` ทั้ง 5
- IT-03 (gateway): ยิงผ่าน nginx ทางเดียว → `curl :80/health` + `:80/api/<auth,products,orders,notifications,cart>/health` ต้อง `ok` ทั้ง 6

## E2E อัตโนมัติ (`e2e/` — Playwright, เจ้าของ: Tester คนที่ 4, ยิงผ่าน gateway :80)
| ID | Spec | Case |
|---|---|---|
| E2E-01 | `gateway.spec.js` (10 เคส) | /health + health 5 services + login ได้ JWT + login ผิด 401 + CRUD สินค้า + สั่งของไม่มีจริงถูกปฏิเสธ |
| E2E-02 | `shop.spec.js` (4 เคส) | เปิดหน้าแรก + login เข้า dashboard + login ผิดโชว์ error + หน้า products โชว์สินค้า |

## วิธีรัน
```bash
# ทีละ service
cd services/<name> && npm install && npm test
# E2E ทั้งระบบ (ต้อง compose up ก่อน)
docker compose up --build -d && cd e2e && npm install && npx playwright install chromium && npm test
# ดูบน CI: แท็บ Actions → job test (matrix 5) + job e2e ต้องเขียว
```

## เกณฑ์ผ่าน
- Unit Test ผ่าน 25/25 ทั้งโลคัลและ CI
- Build Docker 6 images สำเร็จ, push Docker Hub สำเร็จ (tag latest + sha + 1.4.0)
