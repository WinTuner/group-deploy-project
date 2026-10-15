// ROUTE HANDLER: GET /api/me — ให้ Navbar (client) ถามว่า "ตอนนี้ login อยู่ไหม"
// อ่าน JWT จาก httpOnly cookie (client อ่านเองไม่ได้) แล้วยิง auth-service GET /me ด้วย Bearer
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_API } from "@/lib/auth-api";
import { TOKEN_COOKIE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "missing token" }, { status: 401 });

  try {
    const upstream = await fetch(`${AUTH_API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "ต่อ auth-service ไม่ได้" }, { status: 502 });
  }
}
