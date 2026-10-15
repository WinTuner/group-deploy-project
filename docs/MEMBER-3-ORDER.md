# คนที่ 3 — Dev: order-service (port 3003)

โฟลเดอร์: `services/order-service/` — ห้ามแตะ service อื่น

## ต้องมี
- `src/index.js` — Express + `cors` + `express.json()`, store in-memory (`orders`, `seq`)
- `package.json` — `start: node src/index.js`, `test: jest --coverage`
- `Dockerfile` — แบบเดียวกับ product-service
- `tests/order.test.js` — UT-ORDER-01..05

## Endpoints (ห้ามเปลี่ยน contract)
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/orders` | — | 200 array |
| POST | `/orders` | `{productId, qty}` | 201 `{id, productId, qty, status:"created", createdAt}` / 400 ถ้าขาดหรือ `qty<=0` |
| GET | `/orders/:id` | id | 200 obj / 404 |
| GET | `/health` | — | `{"status":"ok"}` |

## Tests (ต้องเขียว)
- UT-ORDER-01: `POST /orders {1,2}` → 201 + `status=created`
- UT-ORDER-02: `POST /orders {1,0}` → 400
- UT-ORDER-03/04: PUT/DELETE (ดู TEST-SPEC)
- UT-ORDER-05: สินค้าไม่มีจริง → 400 `product not found` (เช็ค `product-service` ก่อนสร้าง)

## Inter-service (ของเราตัวแรกที่คุยกัน)
- `POST /orders` ยิง `GET <PRODUCT_SERVICE_URL>/products/:id` (timeout 3 วิ)
- compose ตั้ง `PRODUCT_SERVICE_URL=http://product-service:3002` ให้แล้ว
- product ล่ม → fail-open (รับออเดอร์ต่อ) ยกเว้นตั้ง `STRICT_PRODUCT_CHECK=1`

## รัน/เทส
```bash
cd services/order-service
npm install && npm test
PORT=3003 npm start
curl -X POST localhost:3003/orders -H 'Content-Type: application/json' -d '{"productId":1,"qty":2}'
```

## Done
- [ ] `npm test` ผ่าน 2/2
- [ ] `docker build` ผ่าน, compose รัน port 3003 ผ่าน
- [ ] build fail → แก้ใน service ตัวเองก่อน แล้วค่อยแจ้ง PM

## พูดหน้าชั้น
validate `qty>0` → 400 → Unit Test 2 เคส → วิธีแก้ตอน build/test fail
