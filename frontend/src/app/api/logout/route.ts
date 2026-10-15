// ROUTE HANDLER (mutation #3): POST /api/logout -> ลบ cookie
import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(TOKEN_COOKIE);
  return res;
}
