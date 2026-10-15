// type ของข้อมูลจาก product-service / order-service (ใช้ได้ทั้ง server และ client)
export type Product = { id: number; name: string; price: number };
export type Order = { id: number; productId: number; qty: number; status: string; createdAt: string };

export const baht = (n: number) => `฿${n.toLocaleString("th-TH")}`;
