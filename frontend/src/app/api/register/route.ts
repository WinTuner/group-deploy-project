// ROUTE HANDLER (mutation #2): POST /api/register -> auth-service POST /register
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_API } from "@/lib/auth-api";
import { registerSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  const { username, password } = parsed.data; // ไม่ส่ง confirmPassword ไป backend

  try {
    const upstream = await fetch(`${AUTH_API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status }); // 201 / 400 / 409 ตาม contract
  } catch {
    return NextResponse.json({ error: "ต่อ auth-service ไม่ได้" }, { status: 502 });
  }
}
