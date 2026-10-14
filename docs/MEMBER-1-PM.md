# คนที่ 1 (นัท) — PM: Pipeline + Compose + Docs

ห้ามแตะโค้ดใน `services/*/src` — ดูแลเฉพาะ pipeline, compose, docs

## ไฟล์ที่ดูแล
- `.github/workflows/ci-cd.yml`
- `docker-compose.yml`
- `docs/DEPLOY-PLAN.md`, `docs/TEST-SPEC.md`, `docs/MEMBER-*.md` (ชุดนี้)
- `README.md`

## งาน
1. `docker compose up --build` รันครบ 5 ตัวผ่าน
2. Actions เขียว: job `test` (matrix 4 services) → job `build-push` (5 images)
3. Packages ครบ 5 บน GHCR: `group-auth-service`, `group-product-service`, `group-order-service`, `group-notification-service`, `group-frontend`
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
- [ ] 5 packages บน GHCR + tag `v1.0.0`
- [ ] `:8080` login `admin/password123` ผ่าน

## พูดหน้าชั้น
แผน deploy → pipeline 2 jobs (test block build) → versioning (`latest`/`sha`/`vX.Y.Z`) → `GITHUB_TOKEN` + `packages: write`
