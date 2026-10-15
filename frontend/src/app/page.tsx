// SERVER COMPONENT + SSG — หน้าแนะนำร้านและลำดับการสั่งซื้อเป็นเนื้อหาคงที่
import Link from "next/link";

const steps = [
  { number: "01", title: "เลือกสินค้าที่ชอบ", description: "เลือกดูรายการสินค้าและเพิ่มลงตะกร้าได้ทันที" },
  { number: "02", title: "ตรวจสอบตะกร้า", description: "ปรับจำนวนสินค้าและเช็กยอดรวมก่อนยืนยัน" },
  { number: "03", title: "ยืนยันคำสั่งซื้อ", description: "เข้าสู่ระบบเพื่อสั่งซื้อ แล้วดูรายการได้ที่หน้าออเดอร์" },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-200">
            เลือกง่าย · สั่งซื้อสะดวก
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            ช้อปสิ่งที่ใช่
            <br />
            <span className="text-emerald-300">แล้วสั่งได้ในไม่กี่ขั้นตอน</span>
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            เลือกสินค้าจากรายการ เพิ่มลงตะกร้า และดูรายการคำสั่งซื้อได้ในที่เดียว
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
              เริ่มเลือกสินค้า <span aria-hidden="true">→</span>
            </Link>
            <Link href="/orders" className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white transition hover:bg-white/10">
              ติดตามออเดอร์
            </Link>
          </div>
        </div>
        <div className="relative mt-10 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
          {[
            ["01", "เลือกสินค้า"],
            ["02", "เพิ่มลงตะกร้า"],
            ["03", "ยืนยันคำสั่งซื้อ"],
          ].map(([number, label]) => (
            <div key={number} className="flex items-center gap-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-semibold text-emerald-200">{number}</span>
              <span className="text-slate-200">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">เริ่มต้นได้ทันที</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">สั่งซื้อแบบไม่ยุ่งยาก</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-sm font-bold text-emerald-700">{step.number}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold text-slate-900">พร้อมเลือกสินค้าแล้วหรือยัง?</h2>
          <p className="mt-1 text-sm text-slate-600">ดูรายการสินค้าและเริ่มสร้างตะกร้าของคุณได้เลย</p>
        </div>
        <Link href="/products" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-800 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-900">
          ไปหน้าสินค้า
        </Link>
      </section>
    </div>
  );
}
