// ROUTE HANDLER (mutation #1): POST /api/login
// ทำงานบน server: validate ด้วย zod -> ส่งต่อไป auth-service POST /login -> เก็บ JWT ลง httpOnly cookie
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_API } from "@/lib/auth-api";
import { TOKEN_COOKIE, TOKEN_MAX_AGE } from "@/lib/constants";
import { loginSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${AUTH_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "ต่อ auth-service ไม่ได้" }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json({ error: data.error ?? "login ไม่สำเร็จ" }, { status: upstream.status });
  }

  // ส่งแค่ตัวอย่าง token (40 ตัวแรก) กลับไปโชว์สีเขียว (IT-01) — token เต็มอยู่ใน cookie เท่านั้น
  const res = NextResponse.json({
    username: data.username,
    tokenPreview: `${String(data.token).slice(0, 40)}…`,
  });
  res.cookies.set(TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(req.url).protocol === "https:",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
  return res;
}
