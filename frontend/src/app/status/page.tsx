// SERVER COMPONENT + ISR (Incremental Static Regeneration, revalidate = 30 วินาที)
// ทำไมเลือก ISR: สถานะ service เป็นข้อมูลเดียวกันสำหรับ "ทุกคน" และไม่ต้องสดระดับวินาที
//  - ไม่ใช้ SSG ล้วน: จะค้างค่าตอน build (ซึ่งตอน build service อื่นอาจยังไม่รัน)
//  - ไม่ใช้ SSR: จะยิง service ทุก request ทั้งที่ไม่จำเป็น
// ISR = เสิร์ฟหน้า cache ได้เร็ว และ regenerate ใหม่ในพื้นหลังอย่างช้าสุดทุก 30 วินาที
import { AUTH_API } from "@/lib/auth-api";
import { ORDER_API, PRODUCT_API } from "@/lib/services";

export const revalidate = 30;

const targets = [
  { name: "auth-service", url: AUTH_API },
  { name: "product-service", url: PRODUCT_API },
  { name: "order-service", url: ORDER_API },
];

async function getHealth(url: string) {
  try {
    const r = await fetch(`${url}/health`, { next: { revalidate: 30 } });
    if (!r.ok) return { up: false as const, detail: `HTTP ${r.status}` };
    return { up: true as const, detail: JSON.stringify(await r.json()) };
  } catch {
    return { up: false as const, detail: "ต่อ service ไม่ได้" };
  }
}

export default async function StatusPage() {
  const results = await Promise.all(targets.map(async (t) => ({ ...t, health: await getHealth(t.url) })));
  const generatedAt = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold">📡 Service Status</h1>
      <p className="mt-1 text-sm text-gray-500">หน้านี้เป็น ISR — regenerate อย่างช้าสุดทุก 30 วินาที</p>

      <div className="mt-6 grid gap-3">
        {results.map(({ name, health }) => (
          <div key={name} className={`rounded-xl p-4 ${health.up ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            <p className="font-semibold">
              {name}: {health.up ? "🟢 ONLINE" : "🔴 OFFLINE"}
            </p>
            <p className="mt-1 break-all font-mono text-sm">{health.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-500">สร้างหน้านี้เมื่อ: {generatedAt} (ถ้า refresh แล้วเวลาไม่เปลี่ยน = กำลังเสิร์ฟจาก cache)</p>
    </div>
  );
}
