---
marp: true
theme: default
paginate: true
style: |
  section { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; }
  h1 { color: #0f766e; }
  table { font-size: 0.85em; }
---

# Group Deploy Project
## Micro-services 5 ตัว + Automation ถึง Docker Hub

วิชา Cloud Deployment — นำเสนอหน้าชั้น

---

# สมาชิก + หน้าที่ (คนละ 1 service)

| คน | Role | ดูแล | พูดเรื่อง |
|---|---|---|---|
| 1 (นัท) | PM | `cart-service` + pipeline + docs | แผน deploy, stages, versioning |
| 2 | Developer | `product-service` | CRUD + test + Dockerfile |
| 3 | Developer | `order-service` | CRUD + แก้ build fail + เรียกข้าม service |
| 4 | Tester | `notification-service` + QA + `e2e/` | Test Spec, Automation, ผล build |
| 5 | Dev/Front-end | `auth-service` + frontend | JWT + หน้า Login + nginx image |

---

# สถาปัตยกรรม: ทางเดียวผ่าน nginx `:80`

```
[browser :80] → [nginx] → / → frontend (Next.js + BFF)
                      ├── /api/auth/* → auth :3001 (JWT)
                      ├── /api/products/* → product :3002
                      ├── /api/orders/* → order :3003
                      ├── /api/notifications/* → noti :3004
                      └── /api/cart/* → cart :3005
```

- 5 microservices แยก image กัน + 1 frontend + 1 gateway
- browser เห็นแค่ port เดียว

---

# Service คุยกัน (ล่ม 1 ตัวไม่พัง)

- `order → product` : ของต้องมีจริงก่อนรับออเดอร์
- `order → noti` : ออเดอร์ใหม่แจ้งเตือนอัตโนมัติ
- `cart → product` : ของต้องมีจริงก่อนลงตะกร้า
- `auth → noti` : สมัครแล้วส่ง welcome
- ทุกเส้น **fail-open + timeout 3 วิ** — พิสูจน์แล้ว: ปิด noti ทิ้ง สมัคร/สั่ง/ตะกร้ายัง `201`

---

# Pipeline: test → build-push → e2e

1. **test** — matrix 5 services (`npm install && npm test`)
2. **build-push** — เฉพาะ push main/tag → login Docker Hub → push 6 images
3. **e2e** — `docker compose up` → Playwright 16 เคสผ่าน gateway

Tags: `:latest` (main) + `:sha-xxxx` (ทุก commit) + `:1.5.0` (release)

---

# ผลทดสอบ

- **Unit Test 28/28** — auth 5, product 10, order 6, noti 2, cart 5
- **E2E 16/16** — health 6, login, CRUD, โยงข้าม service, โฟลว์ browser
- **Docker Hub** — `wintuner/group-*:1.5.0` ครบ 6 repos (Public)

---

# Demo (2 นาที)

1. `docker compose up --build` → เปิด `http://localhost:80`
2. Login `admin / password123` → เข้า dashboard
3. สั่งสินค้า → มีแจ้งเตือนเข้า `/status`
4. โชว์ Hub: 6 repos tag `1.5.0` + Actions เขียว

---

# สรุป

- ครบทุกเงื่อนไข: Login, Automation, Container Registry, รายคนมี service, Release version
- แถม: gateway ทางเดียว, mesh แบบล้มไม่พัง, E2E อัตโนมัติ

**จบ — ถามได้ครับ**
