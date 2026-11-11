import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import { createPost } from "@/app/posts/actions";
import PostForm from "@/app/posts/PostForm";

export const metadata: Metadata = { title: "판매글 쓰기 · 고구마마켓" };

// 로그인하지 않은 사용자는 proxy.ts 가 로그인 페이지로 보냅니다.
// (진짜 권한 확인은 서버 액션 createPost 안에서 한 번 더 합니다)
export default function NewPostPage() {
  return (
    <AuthCard title="판매글 쓰기" subtitle="이웃에게 물건을 소개해 주세요.">
      <PostForm
        action={createPost}
        initial={{ title: "", price: "", description: "", status: "selling" }}
        submitLabel="등록하기"
        cancelHref="/"
      />
    </AuthCard>
  );
}
