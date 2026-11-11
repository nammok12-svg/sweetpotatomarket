"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type FormState } from "@/app/auth/actions";
import Field from "@/components/Field";
import FormAlert from "@/components/FormAlert";
import SubmitButton from "@/components/SubmitButton";

export default function LoginForm({
  next,
  authError,
}: {
  next: string;
  authError: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    login,
    authError ? { error: "인증 링크가 만료되었거나 올바르지 않습니다." } : {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Field
        label="이메일"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={state.fields?.email}
        required
      />
      <Field
        label="비밀번호"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormAlert error={state.error} />
      <SubmitButton pending={pending}>로그인</SubmitButton>
      <p className="text-center text-sm text-muted">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
