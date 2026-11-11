import { Suspense } from "react";
import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "로그인 · 고구마마켓" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="다시 오셨군요" subtitle="이메일로 로그인하고 동네 거래를 이어가세요.">
      <Suspense fallback={<div className="h-72" />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

// 주소의 ?next=…&error=… 는 요청 시점에만 알 수 있어서 Suspense 안에서 읽습니다.
async function LoginFormWithParams({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  return <LoginForm next={next} authError={params.error === "auth"} />;
}
