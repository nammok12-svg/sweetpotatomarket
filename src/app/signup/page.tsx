import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import SignupForm from "./SignupForm";

export const metadata: Metadata = { title: "회원가입 · 고구마마켓" };

export default function SignupPage() {
  return (
    <AuthCard title="처음 오셨군요" subtitle="고구마마켓에서 이웃과 따뜻한 거래를 시작해 보세요.">
      <SignupForm />
    </AuthCard>
  );
}
