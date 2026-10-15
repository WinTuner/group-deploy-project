"use client";
// GLOBAL STATE ฝั่ง client (Zustand) — ใช้กับส่วนที่ interactive: Navbar (แสดงชื่อ/ปุ่ม Logout),
// ฟอร์ม login/register (อัปเดตสถานะทันทีหลังสำเร็จ), Dashboard
// เก็บแค่ "ใคร login อยู่" — ตัว token อยู่ใน httpOnly cookie ไม่ได้อยู่ใน store
import { create } from "zustand";

type AuthState = {
  status: "unknown" | "authed" | "guest"; // unknown = ยังไม่ได้เช็คกับ server
  username: string | null;
  setUser: (username: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  username: null,
  setUser: (username) => set({ status: "authed", username }),
  clear: () => set({ status: "guest", username: null }),
}));
