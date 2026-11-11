"use client";

import { deletePost } from "@/app/posts/actions";

/** 삭제 전에 브라우저 확인창을 띄우려고 클라이언트 컴포넌트로 만들었습니다. */
export default function DeleteButton({ id }: { id: number }) {
  return (
    <form
      action={deletePost}
      onSubmit={(e) => {
        if (!confirm("이 판매글을 삭제할까요? 되돌릴 수 없습니다.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-danger transition hover:border-danger/40 hover:bg-danger/5"
      >
        삭제
      </button>
    </form>
  );
}
