// ใช้ได้เฉพาะฝั่ง SERVER (Server Component / Route Handler)
// AUTH_API ไม่มี prefix NEXT_PUBLIC_ จึงไม่ถูกส่งไป browser -> browser คุยกับ auth-service ผ่าน /api/* ของเรา
// ข้อดี: ไม่ติด CORS, ไม่ติด mixed-content (https ↔ http) และซ่อน URL ของ backend ได้
export const AUTH_API = process.env.AUTH_API ?? "http://localhost:3001";
