"use client";
// GLOBAL STATE #2 (Zustand): ตะกร้าสินค้า — ใช้ร่วมกันระหว่างหน้า Products (เพิ่มของ), Navbar (badge จำนวน), Cart (แก้จำนวน/สั่งซื้อ)
// persist ลง localStorage เพื่อไม่ให้ตะกร้าหายตอนรีเฟรช; ใช้ skipHydration แล้วค่อย rehydrate ใน Navbar (useEffect)
// เพื่อไม่ให้ HTML ที่ server render ไม่ตรงกับ client (hydration mismatch)
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = { productId: number; name: string; price: number; qty: number };

type CartState = {
  items: CartItem[];
  add: (p: { id: number; name: string; price: number }) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (p) =>
        set((s) => {
          const found = s.items.find((i) => i.productId === p.id);
          if (found) {
            return { items: s.items.map((i) => (i.productId === p.id ? { ...i, qty: Math.min(99, i.qty + 1) } : i)) };
          }
          return { items: [...s.items, { productId: p.id, name: p.name, price: p.price, qty: 1 }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
