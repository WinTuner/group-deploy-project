---
marp: true
theme: default
paginate: true
header: 'Group Deploy Project — Mini Hackathon'
style: |
  section { font-family: 'Segoe UI', Tahoma, sans-serif; }
  h1 { color: #0f766e; }
  h2 { color: #0f766e; border-bottom: 3px solid #14b8a6; padding-bottom: 6px; }
  code { background: #f0fdfa; }
---

# 🛒 Group Deploy Project
## Micro-services + Automation → Docker Hub

**ทีม 5 คน | 5 services | 1 gateway | 28 unit + 16 e2e | release `1.5.0`**

---

## 🎯 โจทย์

- แยก micro-service รายสมาชิก
- มีหน้า Login
- Deploy ผ่าน Automation → Container Registry
- Unit Test ≥ จำนวนสมาชิก (5)

**ของเรา:** 5 services + nginx ทางเดียว + Docker Hub + เทส 44 เคส

---

## 🏗 สถาปัตยกรรม

```
[browser :80] → [nginx] ─┬─ / → frontend (Next.js + BFF)
                         ├─ /api/auth/* → auth :3001 (JWT)
                         ├─ /api/products/* → product :3002
                         ├─ /api/orders/* → order :3003
                         ├─ /api/notifications/* → noti :3004
                         └─ /api/cart/* → cart :3005
```

ยิงกันเองแบบ **fail-open**: order→product, order→noti, cart→product, auth→noti
ล่ม 1 ตัว ที่เหลือทำงานต่อ ✅ (เทสจริง: ปิด noti แล้วสมัคร/สั่ง/ตะกร้ายัง 201)

---

## 🔁 Pipeline (2 jobs + e2e)

1. **test** — matrix 5 services (`npm test`)
2. **build-push** — push 6 images ขึ้น Docker Hub (`latest` + `sha` + `X.Y.Z`)
3. **e2e** — Playwright 16 เคสผ่าน nginx gateway

`git tag v1.5.0` → ได้ `:1.5.0` ครบ 6 images ทันที

---

## 👥 ใครทำอะไร

| คน | บทบาท | ดูแล |
|---|---|---|
| นัท | PM | cart-service + pipeline + docs |
| 2 | Dev | product-service (CRUD + dashboard) |
| 3 | Dev | order-service (PUT/DELETE + เช็ค product) |
| 4 | Tester | noti-service + QA + e2e 16 เคส |
| 5 | Dev/FE | auth-service (JWT) + Next.js frontend |

---

## 📊 ผลลัพธ์

- ✅ Unit 28/28 | E2E 16/16 | CI เขียว
- ✅ Docker Hub: `wintuner/group-*:1.5.0` ครบ 6
- ✅ เปิด `:80` → login `admin/password123` → dashboard
- ✅ `docker pull` แล้วรันที่ไหนก็ได้

---

## 🔥 จุดขาย

1. **ทางเดียวผ่าน nginx** — ไม่ต้องจำ 6 ports
2. **ล่มตัวเดียวไม่พัง** — fail-open + timeout ทุกเส้น
3. **เจ้าของชัด** — 1 คน 1 service + ใบงาน + branch รายคน

**จบ — ถามได้ครับ 🙏**
