"use client";
// CLIENT COMPONENT: ต้องใช้ useState (เมนูมือถือ), useEffect (ถาม /api/me + โหลดตะกร้า), usePathname/useRouter
// และอ่าน global state (Zustand: auth + cart) -> ทำบน server ไม่ได้ จึงต้องเป็น "use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart";
import { useAuthStore } from "@/lib/store";

const links = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า" },
  { href: "/orders", label: "ออเดอร์" },
  { href: "/status", label: "ระบบ" },
  { href: "/cart", label: "ตะกร้า" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { status, username, setUser, clear } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

  // โหลดตะกร้าจาก localStorage หลัง mount (ดู lib/cart.ts: skipHydration)
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  // โหลดครั้งแรก: ถาม server ว่า cookie ที่มียัง valid ไหม แล้วอัปเดต global state
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then(async (r) => {
        if (cancelled) return;
        if (r.ok) setUser((await r.json()).user.username);
        else clear();
      })
      .catch(() => !cancelled && clear());
    return () => {
      cancelled = true;
    };
  }, [setUser, clear]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    clear();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  const linkCls = (href: string) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition ${
      pathname === href ? "bg-emerald-900 text-white" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
    }`;

  const renderLink = (l: { href: string; label: string }, onClick?: () => void) => (
    <Link key={l.href} href={l.href} className={linkCls(l.href)} onClick={onClick}>
      {l.label}
      {l.href === "/cart" && cartCount > 0 && (
        <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">{cartCount}</span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-sm text-white">GS</span>
          <span>Group Shop</span>
        </Link>

        {/* ปุ่ม hamburger เฉพาะจอเล็ก */}
        <button
          type="button"
          aria-label="เปิด/ปิดเมนู"
          aria-expanded={open}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => renderLink(l))}
          <AuthArea status={status} username={username} onLogout={logout} />
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden">
          {links.map((l) => renderLink(l, () => setOpen(false)))}
          <div className="pt-2">
            <AuthArea status={status} username={username} onLogout={logout} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

function AuthArea({
  status,
  username,
  onLogout,
  onNavigate,
}: {
  status: "unknown" | "authed" | "guest";
  username: string | null;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  if (status === "unknown") return <span className="px-3 text-sm text-gray-400">…</span>;
  if (status === "authed") {
    return (
      <span className="flex items-center gap-2 pl-2 text-sm">
        <Link href="/dashboard" onClick={onNavigate} className="text-slate-600 underline-offset-2 hover:underline">
          สวัสดี, <b>{username}</b>
        </Link>
        <button onClick={onLogout} className="rounded-lg bg-slate-900 px-3 py-1.5 text-white transition hover:bg-slate-700">
          ออกจากระบบ
        </button>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 pl-2 text-sm">
      <Link href="/login" onClick={onNavigate} className="rounded-lg bg-emerald-800 px-3 py-1.5 text-white transition hover:bg-emerald-900">
        เข้าสู่ระบบ
      </Link>
      <Link href="/register" onClick={onNavigate} className="rounded-lg border border-slate-300 px-3 py-1.5 transition hover:bg-slate-100">
        สมัครสมาชิก
      </Link>
    </span>
  );
}
