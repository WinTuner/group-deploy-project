# แผนการ Deploy + Pipeline อัตโนมัติ (PM จัดทำ)

## 1. บทบาทสมาชิก (5 คน)
| คน | Role | Service รับผิดชอบ | สิ่งที่ต้องอธิบายหน้าชั้น |
|----|------|-------------------|--------------------------|
| 1 (นัท) | **PM** | pipeline + `docs/` เท่านั้น (no service code) | แผน deploy, pipeline stages, Test Spec, versioning |
| 2 | Developer | `product-service` | CRUD + Unit Test + Dockerfile ของตัวเอง |
| 3 | Developer | `order-service` | CRUD + Unit Test + แก้ build fail |
| 4 | Tester | `notification-service` + QA pipeline | Test Case automation, ดูผล build/test บน Actions |
| 5 | Developer/Front-end | `auth-service` + `frontend` (Login end-to-end) | API Login/JWT + หน้า Login ยิง API, nginx image |

## 2. สถาปัตยกรรม
```
[frontend :8080] ──POST /login──→ [auth-service :3001] (JWT)
[product :3002] [order :3003] [noti :3004]  (REST แยกอิสระ, แยก image กัน)
```
- แยก repo-path ต่อ service → แยก Dockerfile → แยก image `ghcr.io/<owner>/group-<service>`
- เงื่อนไขครบ: Login มี (API + หน้าเว็บ), Automation ผ่าน GitHub Actions, Push ขึ้น Container Registry, แยก service ต่อคน

## 3. Pipeline (`.github/workflows/ci-cd.yml`) — 2 jobs
1. **test**: matrix 4 services → `npm install && npm test` ทุก PR/push (fail = หยุด ไม่ build)
2. **build-push**: เฉพาะ `push` (PR ไม่ push) → login GHCR → buildx → push 5 images พร้อม tags:
   - `latest` (branch main), `:sha-<short>` (ทุก commit), `:vX.Y.Z` (ตอนติด tag)
- Permissions: `packages: write` (บังคับ ไม่งั้น push GHCR 403)

## 4. ขั้นตอน Deploy จริง (PM สั่ง)
```bash
# ครั้งเดียว: สร้าง repo บน GitHub (ติ๊ก public เพื่อให้ package ฟรี) แล้ว
git init && git add . && git commit -m "feat: 5 microservices + pipeline" 
git branch -M main && git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
# ดูผล: แท็บ Actions → job test/build-push เขียว → แท็บ Packages มี 5 images
# Release version (บังคับโชว์อาจารย์):
git tag v1.0.0 && git push origin v1.0.0
# → ได้ image ghcr.io/<owner>/group-auth-service:v1.0.0 ครบ 5 ตัว
# ดึงไปรันที่ไหนก็ได้:
docker pull ghcr.io/<owner>/group-auth-service:v1.0.0
JWT_SECRET=prod-secret docker compose up -d
```

## 5. Secrets / Settings ที่ต้องตั้ง
- ไม่ต้องตั้งอะไรเพิ่ม (ใช้ `GITHUB_TOKEN` ที่ Actions มีให้)
- ถ้า repo เป็น **private**: Packages → ตั้ง visibility เป็น public หรือ `docker login` ก่อน pull
- `JWT_SECRET`: ตั้งใน compose env / server env ตอน deploy จริง (ห้าม commit ค่าจริง)

## 6. Definition of Done (เช็กลิสต์ส่งอาจารย์)
- [ ] Actions เขียวทั้ง test + build-push
- [ ] มี 5 packages บน GHCR (`group-auth-service`, `group-product-service`, `group-order-service`, `group-notification-service`, `group-frontend`)
- [ ] มี tag `v1.0.0` (Release version) ทุก image
- [ ] เปิด `http://localhost:8080` login `admin/password123` ผ่าน
- [ ] Unit Test ≥ 5 เคส (มี 10 เคส) — ดู `docs/TEST-SPEC.md`
