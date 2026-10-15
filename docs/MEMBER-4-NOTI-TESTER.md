# คนที่ 4 — Tester: notification-service + QA + E2E (port 3004)

โฟลเดอร์: `services/notification-service/` + `e2e/` + เจ้าของ `docs/TEST-SPEC.md`

## ต้องมี
- `src/index.js` — Express + `cors` + `express.json()`, store in-memory (`notifications`, `seq`)
- `package.json` — `start`, `test` มาตรฐาน
- `Dockerfile` — แบบเดียวกับ service อื่น
- `tests/notification.test.js` — UT-NOTI-01/02

## Endpoints (ห้ามเปลี่ยน contract)
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/notifications` | — | 200 array |
| POST | `/notifications` | `{to, message}` | 201 `{id, to, message, sentAt}` / 400 ถ้าขาด |
| GET | `/health` | — | `{"status":"ok"}` |

## Tests (ต้องเขียว)
- UT-NOTI-01: `POST /notifications {to,msg}` → 201 + `sentAt`
- UT-NOTI-02: `POST /notifications {to}` (ขาด message) → 400

## งาน QA เพิ่ม (เจ้าของ)
1. รัน 5 services: `npm test` ผ่าน 24/24 (auth 4, product 10, order 4, noti 2, cart 4)
2. Integration: `docker compose up --build` → `curl :3001/health :3002/health :3003/health :3004/health :3005/health` ต้อง `ok` ทั้ง 5
3. ดูผลบนแท็บ Actions: job `test` เขียว 5/5, fail → แจ้งเจ้าของ service

## งาน E2E เพิ่ม (เจ้าของ `e2e/`)
- Playwright 13 เคส (`gateway.spec.js` 9 + `shop.spec.js` 4) ยิงผ่าน nginx `:80` ทางเดียว
- รันบน CI ทุก push (job `e2e`) + รันโลคัลได้ตาม `e2e/README.md`

```bash
docker compose up --build -d
cd e2e && npm install && npx playwright install chromium && npm test
```

## Done
- [ ] `npm test` service ตัวเอง 2/2 + รวม 24/24
- [ ] IT-02 health ครบ 5 ตัว + E2E 13/13
- [ ] Actions job test + e2e เขียว

## พูดหน้าชั้น
Test Spec 24 เคส → วิธีรันโลคัล + บน CI → เคส fail แปลว่าอะไร ใครแก้
