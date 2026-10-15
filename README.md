# Group Deploy Project — Micro-services (5 คน) + Automation → Docker Hub

## โครง
```
services/auth-service/         ← Member-5: Login/Register + JWT (port 3001)
services/product-service/       ← Member-2 (Dev): CRUD สินค้า (port 3002)
services/order-service/         ← Member-3 (Dev): สร้าง/ดูออเดอร์ (port 3003)
services/notification-service/ ← Member-4 (Tester): ส่ง/ดูแจ้งเตือน (port 3004)
services/cart-service/          ← Member-1 (PM): ตะกร้าสินค้า (port 3005)
frontend/                      ← Member-5: หน้า Login ต่อ auth-service (port 8080)
.github/workflows/ci-cd.yml    ← นัท (PM): Pipeline test → build → push Docker Hub
docker-compose.yml             ← นัท (PM): รันรวมทั้งระบบ
docs/DEPLOY-PLAN.md            ← แผน Deploy (PM เขียน)
docs/TEST-SPEC.md              ← Test Spec 5 คน + Unit Tests ≥5
```

## รันโลคัล
```bash
docker compose up --build
# เปิด http://localhost:8080 → login admin / password123
# API: :3001 (auth) :3002 (product) :3003 (order) :3004 (noti) :3005 (cart)
```

## เทสโลคัล (ทีละ service)
```bash
cd services/auth-service && npm install && npm test
```

## Deploy จริง (3 ขั้น — ดู docs/DEPLOY-PLAN.md)
1. สร้าง GitHub repo → push โค้ดนี้ขึ้น `main`
2. Pipeline `CI/CD → Docker Hub` รันเอง: test 5 services → build+push 6 images ขึ้น `<dockerhub-user>/group-<service>:latest + :sha-xxxx + :vX.Y.Z` (ต้องตั้ง secrets `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` ก่อน — ดู docs/DEPLOY-PLAN.md)
3. Release version: `git tag v1.0.0 && git push origin v1.0.0` → ได้ image tag `v1.0.0` ทุก service (เอาไปโชว์อาจารย์)
