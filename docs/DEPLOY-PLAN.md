# แผนการ Deploy + Pipeline อัตโนมัติ (PM จัดทำ)

## 1. บทบาทสมาชิก (5 คน)
| คน | Role | Service รับผิดชอบ | สิ่งที่ต้องอธิบายหน้าชั้น |
|----|------|-------------------|--------------------------|
| 1 (นัท) | **PM** | `cart-service` + pipeline + `docs/` | แผน deploy, pipeline stages, Test Spec, versioning |
| 2 | Developer | `product-service` | CRUD + Unit Test + Dockerfile ของตัวเอง |
| 3 | Developer | `order-service` | CRUD + Unit Test + แก้ build fail |
| 4 | Tester | `notification-service` + QA pipeline | Test Case automation, ดูผล build/test บน Actions |
| 5 | Developer/Front-end | `auth-service` + `frontend` (Login end-to-end) | API Login/JWT + หน้า Login ยิง API, nginx image |

## 2. สถาปัตยกรรม
```
[frontend :8080] ──POST /login──→ [auth-service :3001] (JWT)
[product :3002] [order :3003] [noti :3004] [cart :3005]  (REST แยกอิสระ, แยก image กัน)
```
- แยก repo-path ต่อ service → แยก Dockerfile → แยก image `<dockerhub-user>/group-<service>`
- เงื่อนไขครบ: Login มี (API + หน้าเว็บ), Automation ผ่าน GitHub Actions, Push ขึ้น Container Registry, แยก service ต่อคน

## 3. Pipeline (`.github/workflows/ci-cd.yml`) — 2 jobs
1. **test**: matrix 5 services → `npm install && npm test` ทุก PR/push (fail = หยุด ไม่ build)
2. **build-push**: เฉพาะ `push` (PR ไม่ push) → login Docker Hub → buildx → push 6 images พร้อม tags:
   - `latest` (branch main), `:sha-<short>` (ทุก commit), `:X.Y.Z (ตัด v ออก)` (ตอนติด tag)

## 4. ขั้นตอน Deploy จริง (PM สั่ง)
```bash
# ครั้งเดียว: สร้าง repo บน GitHub (ติ๊ก public เพื่อให้ package ฟรี) แล้ว
git init && git add . && git commit -m "feat: 5 microservices + pipeline" 
git branch -M main && git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
# ดูผล: แท็บ Actions → job test/build-push เขียว → hub.docker.com มี 6 repos
# Release version (บังคับโชว์อาจารย์):
git tag v1.0.0 && git push origin v1.0.0
# → ได้ image <dockerhub-user>/group-auth-service:v1.0.0 ครบ 6 ตัว
# ดึงไปรันที่ไหนก็ได้:
docker pull <dockerhub-user>/group-auth-service:1.4.0
JWT_SECRET=prod-secret docker compose up -d
```

## 5. Secrets / Settings ที่ต้องตั้ง (รอบเดียว)
Repo → Settings → Secrets and variables → Actions → New repository secret:
- `DOCKERHUB_USERNAME` = ชื่อ user Docker Hub (เช่น `wintuner`)
- `DOCKERHUB_TOKEN` = Access Token (สร้างที่ hub.docker.com → Account Settings → Personal access tokens → Read & Write)
- ถ้าไม่มี 2 ตัวนี้ job build-push จะ fail ตั้งแต่ขั้น login (test ยังรันปกติ)
- ถ้า image เป็น **private**: `docker login` ก่อน pull
- `JWT_SECRET`: ตั้งใน compose env / server env ตอน deploy จริง (ห้าม commit ค่าจริง)

## 6. Definition of Done (เช็กลิสต์ส่งอาจารย์)
- [ ] Actions เขียวทั้ง test + build-push
- [ ] มี 6 repos บน Docker Hub (`group-auth-service`, `group-product-service`, `group-order-service`, `group-notification-service`, `group-cart-service`, `group-frontend`)
- [ ] มี tag `1.4.0` (จาก git tag `v1.4.0`) ครบ 6 images บน Docker Hub
- [ ] เปิด `http://localhost:8080` login `admin/password123` ผ่าน
- [ ] Unit Test ≥ 5 เคส (มี 24 เคส) — ดู `docs/TEST-SPEC.md`
