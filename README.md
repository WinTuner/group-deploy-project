# Group Deploy Project — Micro-services (5 คน) + Automation → Docker Hub

ร้านค้าออนไลน์ 5 microservices + Next.js frontend + nginx gateway ทางเดียว
CI/CD ผ่าน GitHub Actions → Docker Hub (`wintuner/group-*:1.5.0`)

## โครง

```
services/auth-service/          ← natakron-oss: Login/Register + JWT (port 3001)
services/product-service/       ← bkmintra: CRUD สินค้า (port 3002)
services/order-service/         ← Ppggez: ออเดอร์ + เช็ค product-service (port 3003)
services/notification-service/  ← thekorachan: แจ้งเตือน (port 3004)
services/cart-service/          ← WinTuner (PM): ตะกร้า + เช็ค product-service (port 3005)
frontend/                       ← natakron-oss: Next.js + BFF /api/* (port 8080)
nginx/nginx.conf                ← gateway ทางเดียว :80 → ทุก service
e2e/                            ← thekorachan: Playwright 16 เคส ผ่าน gateway
.github/workflows/ci-cd.yml     ← Pipeline: test → build-push → e2e
docker-compose.yml              ← รันรวมทั้งระบบ
docs/                           ← DEPLOY-PLAN, TEST-SPEC, ใบงานรายคน, สไลด์ Marp
```

## สถาปัตยกรรม

```
[browser :80] → [nginx] ─┬─ / → frontend (Next.js + BFF /api/*)
                         ├─ /api/auth/* → auth-service (JWT)
                         ├─ /api/products/* → product-service
                         ├─ /api/orders/* → order-service
                         ├─ /api/notifications/* → notification-service
                         └─ /api/cart/* → cart-service
```

คุยกันเองแบบ **fail-open** (timeout 3 วิ, ล่มตัวเดียวไม่พัง):
`order→product`, `order→noti`, `cart→product`, `auth→noti`

## รันโลคัล

```bash
docker compose up --build
# เปิด http://localhost:80 → login admin / password123
```

## เทส

```bash
# Unit ทีละ service (รวม 28 เคส)
for s in auth-service product-service order-service notification-service cart-service; do
  (cd services/$s && npm install && npm test)
done

# Integration: health ครบ 5 ตัว
for p in 3001 3002 3003 3004 3005; do curl -s localhost:$p/health; echo; done

# E2E ผ่าน gateway (16 เคส)
docker compose up --build -d
cd e2e && npm install && npx playwright install chromium && npm test
```

## 🎬 สคริปต์เดโมโชว์ (8 นาที)

> รัน `docker compose up --build -d` ไว้ก่อนขึ้นพูด

1. **เปิดหน้าเว็บ (1 นาที)** — `http://localhost:80` → login `admin/password123` → เข้า dashboard จริง
2. **โชว์ gateway (1 นาที)** — เปิด `/status` (เขียว ONLINE) + ยิง:
   ```bash
   curl localhost:80/api/products/products   # สินค้าผ่าน nginx
   curl -X POST localhost:80/api/orders/orders \
     -H 'Content-Type: application/json' -d '{"productId":999999,"qty":1}'
   # → 400 product not found (order เช็ค product ให้ดู)
   ```
3. **โชว์ล่มแล้วรอด (2 นาที — จุดขาย)**:
   ```bash
   docker compose stop notification-service
   # สมัครสมาชิก / สั่งของ / ใส่ตะกร้า ผ่านเว็บได้ปกติ (201 หมด)
   docker compose start notification-service
   ```
4. **โชว์ pipeline (2 นาที)** — เปิดแท็บ Actions (เขียว test 5 + build 6 + e2e) → เปิด hub.docker.com 6 repos tag `1.5.0`
5. **สรุปทีม (2 นาที)** — สไลด์ `docs/PRESENTATION.md` หน้าใครทำอะไร + รับคำถาม

## Deploy จริง (ดู docs/DEPLOY-PLAN.md)

1. ตั้ง secrets `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` ใน repo
2. push ขึ้น `main` → pipeline test → build+push 6 images (`latest` + `sha` + `X.Y.Z`)
3. Release: `git tag v1.5.0 && git push origin v1.5.0` → ได้ tag `1.5.0` ทุก image
4. ดึงไปรันที่ไหนก็ได้: `docker pull wintuner/group-auth-service:1.5.0`
