// ใช้ได้เฉพาะฝั่ง SERVER — URL ของ service อื่น ๆ (ไม่มี NEXT_PUBLIC_ จึงไม่หลุดไป browser)
import { AUTH_API } from "@/lib/auth-api";
import type { Product } from "@/lib/types";

export const PRODUCT_API = process.env.PRODUCT_API ?? "http://localhost:3002";
export const ORDER_API = process.env.ORDER_API ?? "http://localhost:3003";

/** ตรวจ JWT กับ auth-service (GET /me) -> คืน user หรือ null */
export async function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const r = await fetch(`${AUTH_API}/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()).user as { sub: number; username: string; iat: number; exp: number };
  } catch {
    return null;
  }
}

export async function fetchProducts(init?: RequestInit & { next?: { revalidate: number } }) {
  const r = await fetch(`${PRODUCT_API}/products`, init);
  if (!r.ok) throw new Error(`product-service HTTP ${r.status}`);
  return (await r.json()) as Product[];
}
