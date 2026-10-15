// SERVER COMPONENT + ISR (revalidate = 15 วินาที)
// ทำไมเลือก ISR: รายการสินค้า "เหมือนกันทุกคน" และเปลี่ยนไม่บ่อย (Member 2 เพิ่ม/แก้/ลบได้)
//  - SSG ล้วน: จะค้างสินค้าตอน build (และตอน build product-service อาจยังไม่รัน)
//  - SSR: ยิง product-service ทุก request เปลืองโดยไม่จำเป็น
//  - ISR: เสิร์ฟจาก cache เร็ว และอัปเดตเองอย่างช้าสุดทุก 15 วินาที
// ส่วน interactive (ปุ่มเพิ่มลงตะกร้า) แยกไปเป็น Client Component <ProductGrid/>
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/services";
import type { Product } from "@/lib/types";

export const revalidate = 15;

export default async function ProductsPage() {
  let products: Product[] = [];
  let error: string | null = null;
  try {
    products = await fetchProducts({ next: { revalidate: 15 } });
  } catch {
    error = "ต่อ product-service ไม่ได้ (ลองรีเฟรชอีกครั้งใน 15 วินาที)";
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">เลือกสิ่งที่ใช่</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">รายการสินค้า</h1>
          <p className="mt-2 text-sm text-slate-500">เลือกสินค้าแล้วเพิ่มลงตะกร้าเพื่อเริ่มสั่งซื้อ</p>
        </div>
        <p className="text-xs text-slate-400">อัปเดตรายการสินค้าอัตโนมัติ</p>
      </div>
      {error ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">ไม่สามารถโหลดสินค้าได้: {error}</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
