"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { PostFormState } from "@/app/posts/actions";
import Field from "@/components/Field";
import FormAlert from "@/components/FormAlert";
import SubmitButton from "@/components/SubmitButton";

type Initial = {
  id?: number;
  title: string;
  price: string;
  description: string;
  status: string;
};

/**
 * 글쓰기·수정에 함께 쓰는 폼.
 * 어떤 서버 액션을 부를지(createPost / updatePost)는 부모 페이지가 action 으로 넘겨줍니다.
 */
export default function PostForm({
  action,
  initial,
  submitLabel,
  cancelHref,
}: {
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
  initial: Initial;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  // 검사에 실패하면 서버가 돌려준 입력값으로 다시 채워 줍니다.
  const v = { ...initial, ...state.fields };
  const isEdit = initial.id !== undefined;

  return (
    // key 를 바꾸면 폼이 다시 만들어져 defaultValue 가 새 값으로 적용됩니다.
    <form key={JSON.stringify(state.fields ?? {})} action={formAction} className="space-y-5">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}

      <Field label="제목" name="title" defaultValue={v.title} maxLength={40} required />
      <Field
        label="가격 (원)"
        name="price"
        inputMode="numeric"
        placeholder="0원이면 나눔"
        defaultValue={v.price}
        hint="숫자만 입력하세요. 0원은 '나눔'으로 표시됩니다."
        required
      />

      {/* 상태 변경은 수정할 때만 — 새 글은 항상 '판매중'으로 시작합니다 */}
      {isEdit && (
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium">
            판매 상태
          </label>
          <select
            id="status"
            name="status"
            defaultValue={v.status}
            className="block w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-3 focus:ring-accent/15"
          >
            <option value="selling">판매중</option>
            <option value="reserved">예약중</option>
            <option value="sold">거래완료</option>
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium">
          자세한 설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          maxLength={2000}
          defaultValue={v.description}
          placeholder="물건 상태, 사용 기간, 거래 희망 장소 등을 적어 주세요."
          className="block w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-3 focus:ring-accent/15"
        />
      </div>

      <FormAlert error={state.error} />
      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      <p className="text-center text-sm">
        <Link href={cancelHref} className="text-muted hover:text-foreground">
          취소
        </Link>
      </p>
    </form>
  );
}
