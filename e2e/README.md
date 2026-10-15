# E2E

Owner: Member-4 (Tester) — Playwright specs ยิงผ่าน nginx gateway ทางเดียว

```bash
docker compose up --build -d
cd e2e
npm install
npx playwright install chromium
npm test
```

เปลี่ยนปลายทาง: `BASE_URL=http://<host>:80 npm test`
