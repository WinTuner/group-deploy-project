// SERVER COMPONENT (หน้า /login): แค่จัดวางหน้าและอ่าน searchParams บน server
// ตัวฟอร์มจริงเป็น Client Component (<LoginForm/>) เพราะต้องมี state + event
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <LoginForm notice={expired ? "session หมดอายุหรือยังไม่ได้ login กรุณา login อีกครั้ง" : undefined} />
    </div>
  );
}
