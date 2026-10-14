# คนที่ 5 — Dev/Front-end: auth-service + frontend (3001 + 8080)

โฟลเดอร์: `services/auth-service/` + `frontend/` — เจ้าของ Login end-to-end

## ต้องมี — auth-service
- `src/index.js` — Express, `bcryptjs`, `jsonwebtoken`, `cors`; user store in-memory; seed `admin/password123`
- `package.json` — deps: `express`, `cors`, `bcryptjs`, `jsonwebtoken`
- `Dockerfile` — `node:20-alpine` + `CMD ["node","src/index.js"]`
- `tests/auth.test.js` — UT-AUTH-01..04

### Endpoints (ห้ามเปลี่ยน contract)
| Method | Path | Input | Output |
|---|---|---|---|
| POST | `/register` | `{username, password}` | 201 `{id, username}` / 400 ขาด / 409 ซ้ำ |
| POST | `/login` | `{username, password}` | 200 `{token, username}` / 401 ผิด |
| GET | `/me` | header `Authorization: Bearer <token>` | 200 `{user}` / 401 ไม่มี/ผิด |
| GET | `/health` | — | `{"status":"ok"}` |

Token: `jwt.sign({sub, username}, JWT_SECRET, {expiresIn:'1h'})` — `JWT_SECRET` จาก env ห้าม hardcode ค่าจริง

### Tests (ต้องเขียว)
- UT-AUTH-01: register user ใหม่ → 201
- UT-AUTH-02: login `admin/password123` → 200 + token
- UT-AUTH-03: login รหัสผิด → 401
- UT-AUTH-04: `/me` ไม่มี token → 401, มี token → 200

## ต้องมี — frontend
- `index.html` — ฟอร์ม login ยิง `POST <AUTH_API>/login`, โชว์ token สีเขียว / error สีแดง; `AUTH_API` default `http://localhost:3001`
- `Dockerfile` — `nginx:alpine`, `COPY index.html`, `EXPOSE 80`

## รัน/เทส
```bash
cd services/auth-service && npm install && npm test
PORT=3001 npm start
curl -X POST localhost:3001/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"password123"}'
# E2E: docker compose up --build → เปิด :8080 → admin/password123 → token เขียว
```

## Done
- [ ] `npm test` 4/4
- [ ] `:8080` login ผ่าน (IT-01)
- [ ] compose: frontend ต่อ auth-service ได้

## พูดหน้าชั้น
hash ด้วย bcrypt → JWT 1h + Bearer `/me` → หน้า login ยิง API → nginx image
