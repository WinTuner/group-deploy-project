// ช่อง input + ข้อความ error ใช้ร่วมกันในฟอร์ม login/register
// (ไม่มี "use client" เอง: ถูก import เข้าไปใน Client Component จึงทำงานฝั่ง client โดยอัตโนมัติ)
import type { ComponentProps } from "react";

type Props = ComponentProps<"input"> & { label: string; error?: string };

export default function Field({ label, error, id, ...rest }: Props) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-800/10 ${
          error ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-emerald-800"
        }`}
        {...rest}
      />
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
