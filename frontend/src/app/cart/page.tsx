// SERVER COMPONENT: หน้า /cart แค่ห่อ <CartView/> (Client Component) เพราะตะกร้าอยู่ใน browser (Zustand + localStorage)
// server ไม่รู้เนื้อหาตะกร้า จึงไม่มีอะไรให้ fetch ที่นี่
import CartView from "@/components/CartView";

export default function CartPage() {
  return <CartView />;
}
