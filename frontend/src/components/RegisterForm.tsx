"use client";
// CLIENT COMPONENT: ฟอร์มสมัครสมาชิก — react-hook-form + zod (มีเช็ค confirm password ด้วย refine)
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Field from "@/components/Field";
import { registerSchema, type RegisterInput } from "@/lib/schemas";

export default function RegisterForm() {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), mode: "onTouched" });

  async function onSubmit(values: RegisterInput) {
    setResult(null);
    try {
      const r = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const j = await r.json();
      if (r.status === 201) {
        setResult({ ok: true, text: `✅ สมัครสำเร็จ: ${j.username} (id ${j.id})` });
        reset();
      } else if (r.status === 409) {
        setResult({ ok: false, text: "❌ username นี้ถูกใช้แล้ว" });
      } else {
        setResult({ ok: false, text: `❌ ${j.error ?? r.status}` });
      }
    } catch (err) {
      setResult({ ok: false, text: `❌ ต่อ API ไม่ได้: ${String(err)}` });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl" aria-hidden="true">📝</span>
      <h1 className="mt-5 mb-6 text-2xl font-bold tracking-tight text-slate-900">สมัครสมาชิก</h1>

      <Field id="username" label="Username" autoComplete="username" error={errors.username?.message} {...register("username")} />
      <Field id="password" label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
      <Field
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-emerald-800 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "กำลังสมัคร…" : "สร้างบัญชี"}
      </button>

      {result && (
        <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {result.text}{" "}
          {result.ok && (
            <Link href="/login" className="underline">
              ไป Login
            </Link>
          )}
        </p>
      )}
    </form>
  );
}
