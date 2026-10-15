// SERVER COMPONENT + SSR (Server-Side Rendering ทุก request)
// ทำไมเลือก SSR (ไม่ใช่ SSG/ISR): เนื้อหา "ขึ้นกับผู้ใช้" — ต้องอ่าน httpOnly cookie ของ request นั้น
// แล้วถาม auth-service GET /me ด้วย Bearer token ถ้า cache ไว้จะเอาข้อมูลคนหนึ่งไปโชว์อีกคน และตรวจ token หมดอายุไม่ได้
// ผลพลอยได้: ถ้าไม่มี/หมดอายุ -> redirect ไป /login ตั้งแต่บน server (ไม่มี flash ของหน้าที่ไม่ควรเห็น)
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthHydrator from "@/components/AuthHydrator";
import { AUTH_API } from "@/lib/auth-api";
import { TOKEN_COOKIE } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Me = { user: { sub: number; username: string; iat: number; exp: number } };

export default async function DashboardPage() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) redirect("/login?expired=1");

  let res: Response;
  try {
    res = await fetch(`${AUTH_API}/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  } catch {
    return (
      <p className="rounded-xl bg-red-50 p-5 text-red-700">❌ ต่อ auth-service ไม่ได้ (AUTH_API = {AUTH_API})</p>
    );
  }
  if (res.status === 401) redirect("/login?expired=1");
  const { user } = (await res.json()) as Me;
  const fmt = (s: number) => new Date(s * 1000).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
      <AuthHydrator username={user.username} />
      <h1 className="text-2xl font-bold">👋 สวัสดี, {user.username}</h1>
      <p className="mt-1 text-sm text-gray-500">หน้านี้ render ฝั่ง server (SSR) จากข้อมูล GET /me ของ auth-service</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          ["User ID (sub)", String(user.sub)],
          ["Username", user.username],
          ["ออก token เมื่อ", fmt(user.iat)],
          ["หมดอายุ", fmt(user.exp)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-gray-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-500">{k}</dt>
            <dd className="mt-1 break-all font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/products" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-700">
          เลือกสินค้า
        </Link>
        <Link href="/orders" className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100">
          ดูออเดอร์
        </Link>
      </div>
    </div>
  );
}
