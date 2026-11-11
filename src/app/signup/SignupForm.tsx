"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type FormState } from "@/app/auth/actions";
import Field from "@/components/Field";
import FormAlert from "@/components/FormAlert";
import SubmitButton from "@/components/SubmitButton";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    signup,
    {},
  );

  // 인증 메일 발송 완료 화면
  if (state.message) {
    return (
      <div className="space-y-5 text-center">
        <FormAlert message={state.message} />
        <Link href="/login" className="inline-block text-sm font-medium text-accent hover:underline">
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
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
        label="닉네임"
        name="nickname"
        autoComplete="nickname"
        placeholder="예) 군고구마"
        minLength={2}
        maxLength={12}
        hint="2~12자, 거래할 때 이웃에게 보여지는 이름입니다."
        defaultValue={state.fields?.nickname}
        required
      />
      <Field
        label="동네 (선택)"
        name="region"
        placeholder="예) 서울 마포구 망원동"
        maxLength={30}
        defaultValue={state.fields?.region}
      />
      <Field
        label="비밀번호"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        hint="8자 이상"
        required
      />
      <Field
        label="비밀번호 확인"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <FormAlert error={state.error} />
      <SubmitButton pending={pending}>가입하기</SubmitButton>
      <p className="text-center text-sm text-muted">
        이미 회원이신가요?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
