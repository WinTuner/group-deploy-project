# คนที่ 1 (นัท) — PM: cart-service + Pipeline + Compose + Docs

## ไฟล์ที่ดูแล
- `services/cart-service/` (เจ้าของ service ตัวที่ 5)
- `.github/workflows/ci-cd.yml`
- `docker-compose.yml`
- `docs/DEPLOY-PLAN.md`, `docs/TEST-SPEC.md`, `docs/MEMBER-*.md` (ชุดนี้)
- `README.md`

## cart-service (port 3005)
- `src/index.js` — Express + `cors` + `express.json()`, store in-memory
- `package.json` / `Dockerfile` มาตรฐานแบบ service อื่น

### Endpoints (ห้ามเปลี่ยน contract)
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/cart?userId=` | — | 200 array (กรองตาม user ถ้าส่งมา) |
| POST | `/cart` | `{userId, productId, qty}` | 201 obj + id / 400 ถ้าขาดหรือ `qty` นอก 1..99 |
| PUT | `/cart/:id` | `{qty}` | 200 obj / 400/404 |
| DELETE | `/cart/:id` | — | 204 / 404 |
| GET | `/health` | — | `{"status":"ok"}` |

### Tests (ต้องเขียว)
- UT-CART-01..05 (ดู `docs/TEST-SPEC.md`)

```bash
cd services/cart-service && npm install && npm test
curl -X POST localhost:3005/cart -H 'Content-Type: application/json' -d '{"userId":"u1","productId":1,"qty":2}'
```

## งาน
1. `docker compose up --build` รันครบ 5 ตัวผ่าน
2. Actions เขียว: job `test` (matrix 5 services) → job `build-push` (6 images)
3. Repos ครบ 6 บน Docker Hub: `group-auth-service`, `group-product-service`, `group-order-service`, `group-notification-service`, `group-cart-service`, `group-frontend`
4. ติด tag `git tag v1.0.0 && git push origin v1.0.0` → ได้ tag `:v1.0.0` ทุก image
5. สั่ง `JWT_SECRET` ตอน deploy จริง ห้าม commit ค่าจริง

## สั่ง deploy
```bash
docker compose up --build
# ดู Actions → Packages → tag v1.0.0
JWT_SECRET=prod-secret docker compose up -d
```

## Done
- [ ] Actions เขียว test + build-push
- [ ] 6 repos บน Docker Hub + tag `1.4.0` (git tag `v1.4.0`) (ตั้ง secrets `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` ใน repo ก่อน ไม่งั้น login fail)
- [ ] `:8080` login `admin/password123` ผ่าน

## พูดหน้าชั้น
แผน deploy → pipeline 2 jobs (test block build) → versioning (`latest`/`sha`/`vX.Y.Z`) → login Docker Hub ด้วย secrets
