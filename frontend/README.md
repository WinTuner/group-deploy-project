# Frontend (Next.js App Router) — Member-5

ระบบสั่งซื้อ: Login (auth-service) → เลือกสินค้า (product-service) → ตะกร้า → สั่งซื้อ (order-service) → ดูออเดอร์
เจ้าของ: **Member-5** (`frontend/` + `services/auth-service/`)

## รันโลคัล
```bash
# 1) เปิด service ที่ต้องใช้ (แต่ละอันคนละ terminal)
cd services/auth-service    && npm install && PORT=3001 npm start
cd services/product-service && npm install && PORT=3002 npm start
cd services/order-service   && npm install && PORT=3003 npm start

# 2) เปิด frontend
cd frontend && cp .env.example .env.local && npm install && npm run dev   # http://localhost:3000
```
หรือทั้งระบบ: `docker compose up --build` → http://localhost:8080 (login `admin / password123`)

## หน้า/Route
| Route | หน้าที่ | ต้อง login |
|---|---|---|
| `/` | Home | ไม่ |
| `/login`, `/register` | ฟอร์ม (react-hook-form + zod) | ไม่ |
| `/products` | รายการสินค้าจาก product-service + ปุ่มเพิ่มลงตะกร้า | ไม่ |
| `/cart` | ตะกร้า (แก้จำนวน/ลบ) + ปุ่มสั่งซื้อ | ต้อง login ตอนกดสั่งซื้อ |
| `/orders` | ออเดอร์ทั้งหมดจาก order-service (แสดงชื่อ/ราคาจาก product-service) | ใช่ |
| `/dashboard` | ข้อมูล user จาก `GET /me` | ใช่ |
| `/status` | สถานะ auth / product / order service | ไม่ |
| `/api/login` `/api/register` `/api/logout` `/api/me` `/api/orders` | Route Handlers (mutation + proxy) | — |

## Final Project Requirement Checklist

| # | ข้อกำหนด | ทำที่ไหน |
|---|---|---|
| 1 | Next.js App Router ≥ 4 route | 8 หน้า (ตารางด้านบน) + 5 Route Handlers |
| 2 | Server + Client Component พร้อมเหตุผล | ตารางด้านล่าง (และคอมเมนต์ในทุกไฟล์) |
| 3 | Data fetching ใช้ SSR/SSG/ISR อย่างเจตนา | ตารางด้านล่าง |
| 4 | Mutation ผ่าน Server Action / Route Handler | Route Handler: `POST /api/login`, `/api/register`, `/api/logout`, `/api/orders` |
| 5 | Global state ฝั่ง client | Zustand 2 store: `lib/store.ts` (auth), `lib/cart.ts` (ตะกร้า, persist localStorage) |
| 6 | ฟอร์ม validate จริง (react-hook-form + zod) | `LoginForm`, `RegisterForm` + `lib/schemas.ts` (validate ซ้ำฝั่ง server ใน Route Handler) |
| 7 | Responsive + deploy Vercel | Tailwind mobile-first + hamburger menu / ขั้นตอน deploy ด้านล่าง |

### Server vs Client Component — ทำไมแต่ละไฟล์เป็นแบบนั้น
| ไฟล์ | ประเภท | เหตุผล |
|---|---|---|
| `app/layout.tsx` | Server | แค่โครง HTML ไม่มี state (และไม่อ่าน cookie เพื่อให้ `/` เป็น static ได้) |
| `app/page.tsx` | Server | เนื้อหาคงที่ ไม่มี interaction |
| `app/login/page.tsx`, `register/page.tsx`, `cart/page.tsx` | Server | จัดวางหน้า แล้วฝัง Client Component ที่มีฟอร์ม/ตะกร้า |
| `app/products/page.tsx` | Server | fetch product-service บน server แล้วส่งเป็น props ให้ `ProductGrid` |
| `app/orders/page.tsx`, `dashboard/page.tsx` | Server | อ่าน httpOnly cookie + เรียก service ด้วย token บน server — token ไม่หลุดไป browser |
| `app/status/page.tsx` | Server | fetch ข้อมูลบน server ด้วย cache (ISR) |
| `components/Navbar.tsx` | **Client** | `useState` (เมนูมือถือ), `useEffect`, `usePathname` และอ่าน global state (auth + จำนวนในตะกร้า) |
| `components/ProductGrid.tsx` | **Client** | ปุ่มเพิ่มลงตะกร้า (onClick) เขียน global state |
| `components/CartView.tsx` | **Client** | แก้จำนวนสินค้า + กดสั่งซื้อ (state + event + fetch) |
| `components/LoginForm.tsx`, `RegisterForm.tsx` | **Client** | react-hook-form ต้องใช้ hooks/event handler |
| `components/AuthHydrator.tsx` | **Client** | เอาค่าที่ server ตรวจแล้วใส่ Zustand (`useEffect`) |
| `components/Field.tsx` | ไม่มี directive | ไม่มี state; ถูกใช้ภายใน Client Component |

### Rendering strategy — ทำไมเลือกแบบนั้น (ไม่ใช่ default เฉย ๆ)
| หน้า | กลยุทธ์ | เหตุผล |
|---|---|---|
| `/` | **SSG** | เนื้อหาเหมือนกันทุกคนและไม่เปลี่ยน → สร้างตอน build เสิร์ฟจาก CDN เร็วสุด |
| `/products` | **ISR** (`revalidate = 15`) | สินค้าเหมือนกันทุกคน เปลี่ยนไม่บ่อย (Member 2 เพิ่ม/แก้/ลบได้). SSG ล้วนจะค้างค่าตอน build, SSR จะยิง product-service ทุก request. ISR เสิร์ฟ cache เร็วและอัปเดตเองทุก ≤15 วิ |
| `/status` | **ISR** (`revalidate = 30`) | `GET /health` เหมือนกันทุกคน ไม่ต้องสดระดับวินาที (เหตุผลเดียวกับ `/products`) |
| `/orders` | **SSR** (`force-dynamic`) | ออเดอร์เปลี่ยนตลอด (สั่งแล้วต้องเห็นทันที) และต้องเช็ค login ทุก request → cache ไม่ได้ |
| `/dashboard` | **SSR** (`force-dynamic`) | เนื้อหา **ขึ้นกับผู้ใช้** (cookie + `GET /me`) ห้าม cache ข้ามคน และต้องเช็ค token หมดอายุ |

ทดสอบ ISR: เปิด `/status` ตอนปิด service จะขึ้น 🔴 OFFLINE → เปิด service แล้วรอ >30 วิ รีเฟรช 1–2 ครั้ง จะเป็น 🟢 ONLINE

### Flow การสั่งซื้อ
```
Browser ──POST /api/login──▶ Route Handler (zod) ──▶ auth-service /login ──▶ Set-Cookie token (HttpOnly)
Browser: /products (ISR) ──[เพิ่มลงตะกร้า]──▶ Zustand cart (localStorage)
Browser ──POST /api/orders {items}──▶ Route Handler
     1) cookie → auth-service GET /me   (ไม่ login = 401)
     2) zod validate                    (qty 1–99)
     3) product-service GET /products   (สินค้าต้องมีอยู่จริง)
     4) order-service POST /orders ทีละรายการ → 201
Browser: /orders (SSR) ← order-service GET /orders + product-service (ชื่อ/ราคา)
```
- browser **ไม่คุยกับ service ตรง ๆ** → ไม่ติด CORS / mixed-content และซ่อน URL backend
- token อยู่ใน **httpOnly cookie** (JS อ่านไม่ได้); Zustand เก็บแค่ username และตะกร้า
- ฟอร์ม login โชว์ `tokenPreview` (40 ตัวแรก) สีเขียว / error สีแดง ตาม IT-01
- order-service ไม่มี field "เจ้าของออเดอร์" (contract ของ Member 3) หน้า `/orders` จึงแสดงออเดอร์ทั้งระบบ

## Environment variable (ฝั่ง server เท่านั้น)
| ชื่อ | local | docker compose (default ใน Dockerfile) |
|---|---|---|
| `AUTH_API` | `http://localhost:3001` | `http://auth-service:3001` |
| `PRODUCT_API` | `http://localhost:3002` | `http://product-service:3002` |
| `ORDER_API` | `http://localhost:3003` | `http://order-service:3003` |

## Deploy Vercel (ต้องมี URL จริง)
Vercel รัน Next.js ได้ แต่ **auth / product / order service (Express) ต้อง deploy ที่ใดที่หนึ่งก่อน** ให้มี URL สาธารณะ
(เช่น Render / Railway — ใช้ Dockerfile ของแต่ละ service ได้เลย, auth-service ตั้ง env `JWT_SECRET`)
1. Vercel → *Add New Project* → import repo → **Root Directory = `frontend`**
2. Environment Variables: `AUTH_API`, `PRODUCT_API`, `ORDER_API` = URL ของแต่ละ service (ไม่มี `/` ท้าย)
3. Deploy → ได้ `https://<project>.vercel.app` → ทดสอบ login `admin / password123` แล้วลองสั่งซื้อ

> ทุก service เก็บข้อมูลใน memory (ตามดีไซน์ของโปรเจกต์) ถ้า restart ข้อมูลจะกลับไปเป็นค่าตั้งต้น

## หมายเหตุเทียบกับ `docs/MEMBER-5-AUTH-FRONTEND.md`
เอกสารเดิมระบุ frontend เป็น `index.html` + `nginx:alpine` แต่ Checklist Final Project บังคับ Next.js (RHF+zod, SSR/ISR, Route Handler) จึงเปลี่ยน `frontend/` เป็น Next.js:
`Dockerfile` ยังคง **port 80** และชื่อ service `frontend` เดิม → `docker-compose.yml` และ `ci-cd.yml` ของ PM ใช้ได้โดยไม่ต้องแก้
