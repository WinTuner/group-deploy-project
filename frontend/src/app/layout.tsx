// SERVER COMPONENT: layout หลัก — ไม่มี state/event เลย แค่ห่อ HTML + วาง <Navbar/>
// เหตุผล: ไม่ต้องส่ง JS ของ layout ไป browser; ส่วนที่ต้อง interactive แยกไปอยู่ใน Navbar (Client Component)
// หมายเหตุ: layout ไม่อ่าน cookies() เพื่อให้หน้า / ยังเป็น Static (SSG) ได้
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Group Shop — สั่งซื้อสินค้าออนไลน์",
  description: "เลือกสินค้า จัดการตะกร้า และติดตามคำสั่งซื้อ",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
