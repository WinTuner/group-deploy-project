import { z } from "zod";

// Schema เดียว ใช้ทั้งฝั่ง client (react-hook-form) และ server (Route Handler) -> validate 2 ชั้น

export const loginSchema = z.object({
  username: z.string().trim().min(1, "กรุณากรอก username"),
  password: z.string().min(1, "กรุณากรอก password"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "username ต้องมีอย่างน้อย 3 ตัวอักษร")
      .max(20, "username ยาวได้ไม่เกิน 20 ตัวอักษร")
      .regex(/^[a-zA-Z0-9_]+$/, "ใช้ได้เฉพาะ a-z, 0-9 และ _"),
    password: z.string().min(6, "password ต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(1, "กรุณายืนยัน password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "password ทั้งสองช่องไม่ตรงกัน",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ตะกร้า -> สั่งซื้อ: validate ที่ Route Handler /api/orders (ฝั่ง server)
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        qty: z.number().int().min(1, "จำนวนต้องมากกว่า 0").max(99, "สั่งได้สูงสุด 99 ชิ้นต่อรายการ"),
      }),
    )
    .min(1, "ตะกร้าว่าง")
    .max(20),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
