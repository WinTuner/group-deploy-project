"use client";
// CLIENT COMPONENT: ปุ่ม "เพิ่มลงตะกร้า" ต้องมี onClick และเขียน global state (Zustand cart)
// รายการสินค้าเองมาจาก Server Component (หน้า /products) ผ่าน props
import Link from "next/link";
import { useCartStore } from "@/lib/cart";
import { baht, type Product } from "@/lib/types";

export default function ProductGrid({ products }: { products: Product[] }) {
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        ยังไม่มีสินค้าให้เลือกในขณะนี้
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const inCart = items.find((i) => i.productId === p.id)?.qty ?? 0;
        return (
          <article key={p.id} className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
            <div>
              <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-slate-100">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-emerald-800 shadow-sm">
                  {p.name.slice(0, 1)}
                </span>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">สินค้า #{p.id}</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-900" title={p.name}>{p.name}</h2>
              <p className="mt-2 text-xl font-bold text-emerald-900">{baht(p.price)}</p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                onClick={() => add(p)}
                aria-label={`เพิ่ม ${p.name} ลงตะกร้า`}
                className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                + เพิ่มลงตะกร้า
              </button>
              {inCart > 0 && (
                <Link href="/cart" className="text-right text-sm font-medium text-emerald-800 underline-offset-2 hover:underline">
                  ในตะกร้า <span className="font-bold">{inCart}</span>
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
