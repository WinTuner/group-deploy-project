// SERVER COMPONENT + SSR (ทุก request)
// ทำไมเลือก SSR: ออเดอร์เปลี่ยนตลอด (เพิ่งสั่งแล้วต้องเห็นทันที) และหน้านี้ต้อง login (เช็ค cookie -> auth-service)
// ถ้าไม่ผ่านให้ redirect จาก server เลย ข้อมูลออเดอร์จะไม่ถูก cache ข้ามคน
// หมายเหตุ: order-service ไม่มีแนวคิด "เจ้าของออเดอร์" (contract ห้ามเปลี่ยน) จึงแสดงออเดอร์ทั้งระบบ
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TOKEN_COOKIE } from "@/lib/constants";
import { fetchProducts, ORDER_API, verifyToken } from "@/lib/services";
import { baht, type Order, type Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await verifyToken((await cookies()).get(TOKEN_COOKIE)?.value);
  if (!user) redirect("/login?expired=1");

  let orders: Order[] = [];
  let products: Product[] = [];
  try {
    const [o, p] = await Promise.all([
      fetch(`${ORDER_API}/orders`, { cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<Order[]>;
      }),
      fetchProducts({ cache: "no-store" }).catch(() => [] as Product[]),
    ]);
    orders = o;
    products = p;
  } catch {
    return <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">ไม่สามารถโหลดออเดอร์ได้ เนื่องจากเชื่อมต่อ order-service ไม่สำเร็จ</p>;
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  const sorted = [...orders].reverse(); // ใหม่สุดขึ้นก่อน

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">ติดตามรายการ</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">ออเดอร์</h1>
        <p className="mt-2 text-sm text-slate-500">รายการคำสั่งซื้อทั้งหมดในระบบ · {orders.length} รายการ</p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl" aria-hidden="true">📦</span>
          <h2 className="mt-4 font-semibold text-slate-900">ยังไม่มีคำสั่งซื้อ</h2>
          <p className="mt-1 text-sm text-slate-500">เมื่อสั่งซื้อสินค้าแล้ว รายการจะแสดงที่นี่</p>
          <Link href="/products" className="mt-5 inline-flex rounded-xl bg-emerald-800 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-900">
            ไปเลือกสินค้า
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {sorted.map((o) => {
            const p = byId.get(o.productId);
            return (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-semibold text-emerald-800" aria-hidden="true">
                    {p?.name.slice(0, 1) ?? "สินค้า"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {p ? p.name : `สินค้า #${o.productId}`}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">ออเดอร์ #{o.id} · จำนวน {o.qty} ชิ้น</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-slate-900">{p ? baht(p.price * o.qty) : "—"}</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{o.status}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
