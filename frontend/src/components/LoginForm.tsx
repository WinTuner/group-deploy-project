"use client";
// CLIENT COMPONENT: ฟอร์มต้องมี state/event (react-hook-form) + เขียน global state หลัง login สำเร็จ
// validate จริงด้วย react-hook-form + zod (zodResolver) — แสดง error ใต้ช่องทันทีที่ blur
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { useAuthStore } from "@/lib/store";

export default function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  async function onSubmit(values: LoginInput) {
    setResult(null);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const j = await r.json();
      if (!r.ok) {
        setResult({ ok: false, text: `❌ ${j.error ?? r.status}` }); // สีแดง
        return;
      }
      setUser(j.username); // อัปเดต global state -> Navbar เปลี่ยนทันที
      setResult({ ok: true, text: `✅ token: ${j.tokenPreview}` }); // สีเขียว
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      setResult({ ok: false, text: `❌ ต่อ API ไม่ได้: ${String(err)}` });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl" aria-hidden="true">🔐</span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">เข้าสู่ระบบ</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">เข้าสู่ระบบเพื่อยืนยันคำสั่งซื้อและติดตามออเดอร์</p>
      {notice && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}

      <Field id="username" label="Username" autoComplete="username" error={errors.username?.message} {...register("username")} />
      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-emerald-800 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>

      {result && (
        <p role="status" className={`mt-4 break-all rounded-xl p-3 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {result.text}
        </p>
      )}
    </form>
  );
}
