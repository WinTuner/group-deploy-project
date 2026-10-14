# คนที่ 2 — Dev: product-service (port 3002)

โฟลเดอร์: `services/product-service/` — ห้ามแตะ service อื่น

## ต้องมี
- `src/index.js` — Express + `cors` + `express.json()`, store in-memory
- `package.json` — `start: node src/index.js`, `test: jest --coverage`, deps: `express`, `cors`
- `Dockerfile` — `node:20-alpine`, `npm install --production`, `COPY src`, `CMD ["node","src/index.js"]`
- `tests/product.test.js` — UT-PROD-01/02 (ดูข้างล่าง)

## Endpoints (ห้ามเปลี่ยน contract)
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/products` | — | 200 array |
| GET | `/products/:id` | id | 200 obj / 404 |
| POST | `/products` | `{name, price}` | 201 obj + id / 400 ถ้าขาด |
| GET | `/health` | — | `{"status":"ok"}` |

Seed ตั้งต้น: `Keyboard/1290`, `Mouse/590`

## Tests (ต้องเขียว)
- UT-PROD-01: `GET /products` → 200 array
- UT-PROD-02: `POST /products {Monitor,4990}` → 201 + id

## รัน/เทส
```bash
cd services/product-service
npm install && npm test
PORT=3002 npm start
curl localhost:3002/health
curl localhost:3002/products
```

## Done
- [ ] `npm test` ผ่าน 2/2
- [ ] `docker build` ผ่าน, compose รัน port 3002 ผ่าน
- [ ] ไม่แก้ contract ข้างบนโดยไม่บอกทีม

## พูดหน้าชั้น
CRUD + validate `name & price` → 400/404 → Unit Test 2 เคส → Dockerfile ของตัวเอง
