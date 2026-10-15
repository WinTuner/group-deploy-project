"use client";
// CLIENT COMPONENT: อ่าน/แก้ตะกร้าจาก global state (Zustand) + กดสั่งซื้อ -> POST /api/orders
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/lib/cart";
import { baht } from "@/lib/types";

export default function CartView() {
  const { items, setQty, remove, clear } = useCartStore();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; needLogin?: boolean } | null>(null);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function checkout() {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, qty: i.qty })) }),
      });
      const j = await r.json();
      if (r.status === 201) {
        clear();
        setResult({ ok: true, text: `✅ สั่งซื้อสำเร็จ ${j.orders.length} รายการ (order #${j.orders.map((o: { id: number }) => o.id).join(", #")})` });
      } else {
        setResult({ ok: false, text: `❌ ${j.error ?? r.status}`, needLogin: r.status === 401 });
      }
    } catch (err) {
      setResult({ ok: false, text: `❌ ต่อ API ไม่ได้: ${String(err)}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">ตรวจสอบก่อนสั่งซื้อ</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">ตะกร้าสินค้า</h1>
        <p className="mt-2 text-sm text-slate-500">ปรับจำนวนหรือนำสินค้าออกได้ก่อนยืนยันคำสั่งซื้อ</p>
      </div>

      {items.length === 0 && !result?.ok && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl" aria-hidden="true">🛒</span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">ตะกร้าของคุณยังว่างอยู่</h2>
          <p className="mt-1 text-sm text-slate-500">เลือกสินค้าแล้วกลับมาดำเนินการสั่งซื้อได้ที่นี่</p>
          <Link href="/products" className="mt-5 inline-flex rounded-xl bg-emerald-800 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-900">
            ไปเลือกสินค้า
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm sm:px-6">
            {items.map((i) => (
              <li key={i.productId} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-semibold text-emerald-800" aria-hidden="true">
                    {i.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{i.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{baht(i.price)} / ชิ้น</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                  <div className="flex items-center rounded-xl border border-slate-200">
                    <button
                      type="button"
                      aria-label={`ลดจำนวน ${i.name}`}
                      className="h-9 w-9 rounded-l-xl text-slate-600 transition hover:bg-slate-50"
                      onClick={() => setQty(i.productId, i.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-sm font-medium" aria-live="polite">{i.qty}</span>
                    <button
                      type="button"
                      aria-label={`เพิ่มจำนวน ${i.name}`}
                      className="h-9 w-9 rounded-r-xl text-slate-600 transition hover:bg-slate-50"
                      onClick={() => setQty(i.productId, i.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="w-24 text-right font-semibold text-slate-900">{baht(i.price * i.qty)}</span>
                  <button
                    type="button"
                    aria-label={`ลบ ${i.name}`}
                    className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    onClick={() => remove(i.productId)}
                  >
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">สรุปคำสั่งซื้อ</h2>
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
              <span>ยอดรวมสินค้า</span>
              <span>{baht(total)}</span>
            </div>
            <div className="mt-3 flex justify-between text-lg font-bold text-slate-900">
              <span>ยอดสุทธิ</span>
              <span>{baht(total)}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">ตรวจสอบรายการให้เรียบร้อยก่อนกดยืนยันสั่งซื้อ</p>
            <button
              onClick={checkout}
              disabled={busy}
              className="mt-5 w-full rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "กำลังสั่งซื้อ…" : "ยืนยันคำสั่งซื้อ"}
            </button>
            <Link href="/products" className="mt-3 block text-center text-sm font-medium text-emerald-800 hover:underline">
              เลือกสินค้าต่อ
            </Link>
          </aside>
        </div>
      )}

      {result && (
        <p role="status" className={`mt-5 rounded-xl p-4 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {result.text}{" "}
          {result.ok && (
            <Link href="/orders" className="ml-1 font-semibold underline underline-offset-2">
              ดูออเดอร์ของฉัน
            </Link>
          )}
          {result.needLogin && (
            <Link href="/login" className="ml-1 font-semibold underline underline-offset-2">
              เข้าสู่ระบบ
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
