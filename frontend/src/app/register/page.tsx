// SERVER COMPONENT (หน้า /register): ห่อ <RegisterForm/> ซึ่งเป็น Client Component
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <RegisterForm />
    </div>
  );
}
