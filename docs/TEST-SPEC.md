# Test Specification (PM ออกแบบ — ครบ 5 คน, Unit Test 24 เคส ≥ 5)

## สรุป
- Framework: **Jest + Supertest** (รันบน CI ทุก PR/push, fail แล้วบล็อก build-push)
- รวม 24 Unit Tests (เกินขั้นต่ำ 5): auth 4, product 10, order 4, noti 2, cart 4
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
| UT-NOTI-01 | Tester (4) | noti | ส่งแจ้งเตือน | POST /notifications {to,msg} | 201 + sentAt |
| UT-NOTI-02 | Tester (4) | noti | ขาด message ถูกปฏิเสธ | POST /notifications {to} | 400 |
| UT-CART-01 | PM (1) | cart | เพิ่มของลงตะกร้า | POST /cart {u1,1,2} | 201 + id |
| UT-CART-02 | PM (1) | cart | qty นอก 1..99 ถูกปฏิเสธ | POST /cart {u1,1,0} | 400 |
| UT-CART-03 | PM (1) | cart | แก้จำนวนในตะกร้า | PUT /cart/:id {qty:3} | 200 qty=3 |
| UT-CART-04 | PM (1) | cart | ลบของออกจากตะกร้า | DELETE /cart/:id | 204 |

## Integration / E2E (Tester รันเสริม, ไม่บังคับนับโควต้า)
- IT-01 (Frontend คนที่ 5): เปิด `:8080` → กรอก admin/password123 → ได้ token โชว์สีเขียว
- IT-02: `docker compose up --build` → `curl :3001/health :3002/health :3003/health :3004/health :3005/health` ต้อง `{"status":"ok"}` ทั้ง 5

## วิธีรัน
```bash
# ทีละ service
cd services/<name> && npm install && npm test
# ดูบน CI: แท็บ Actions → job test (matrix 5) ต้องเขียว 5/5
```

## เกณฑ์ผ่าน
- Unit Test ผ่าน 24/24 ทั้งโลคัลและ CI
- Build Docker 6 images สำเร็จ, push GHCR สำเร็จ (tag latest + sha + v1.3.0)
