"use client";
// CLIENT COMPONENT เล็ก ๆ: รับ username ที่ server (หน้า Dashboard) ตรวจแล้ว มาใส่ global state ทันที
// -> Navbar ไม่ต้องรอ /api/me. ไม่ render อะไรเลย (return null)
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

export default function AuthHydrator({ username }: { username: string }) {
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(() => setUser(username), [username, setUser]);
  return null;
}
