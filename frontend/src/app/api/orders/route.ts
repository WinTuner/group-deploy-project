// ROUTE HANDLER (mutation #4): POST /api/orders  { items: [{productId, qty}] }
// 1) ต้อง login (ตรวจ JWT จาก cookie กับ auth-service)  2) validate ด้วย zod
// 3) เช็คว่าสินค้ามีจริงใน product-service  4) สร้าง order ทีละรายการที่ order-service (POST /orders)
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";
import { checkoutSchema } from "@/lib/schemas";
import { fetchProducts, ORDER_API, verifyToken } from "@/lib/services";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await verifyToken((await cookies()).get(TOKEN_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "กรุณา login ก่อนสั่งซื้อ" }, { status: 401 });

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

  let products;
  try {
    products = await fetchProducts({ cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "ต่อ product-service ไม่ได้" }, { status: 502 });
  }
  const ids = new Set(products.map((p) => p.id));
  const missing = parsed.data.items.find((i) => !ids.has(i.productId));
  if (missing) {
    return NextResponse.json({ error: `ไม่พบสินค้า id ${missing.productId} (อาจถูกลบไปแล้ว)` }, { status: 400 });
  }

  const created: Order[] = [];
  for (const item of parsed.data.items) {
    try {
      const r = await fetch(`${ORDER_API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
        cache: "no-store",
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        return NextResponse.json({ error: data.error ?? "สร้างออเดอร์ไม่สำเร็จ", created }, { status: r.status });
      }
      created.push(data);
    } catch {
      return NextResponse.json({ error: "ต่อ order-service ไม่ได้", created }, { status: 502 });
    }
  }
  return NextResponse.json({ orders: created }, { status: 201 });
}
