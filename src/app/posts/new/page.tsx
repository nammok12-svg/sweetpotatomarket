import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { getCurrentUser } from "@/lib/auth";
import { createPost } from "@/app/posts/actions";
import PostForm from "@/app/posts/PostForm";

export const metadata: Metadata = { title: "판매글 쓰기 · 고구마마켓" };

// 로그인하지 않은 사용자는 proxy.ts 가 로그인 페이지로 보냅니다.
// (진짜 권한 확인은 서버 액션 createPost 안에서 한 번 더 합니다)
export default function NewPostPage() {
  return (
    <AuthCard title="판매글 쓰기" subtitle="이웃에게 물건을 소개해 주세요.">
      {/* 사진을 내 폴더에 올리려면 내 id 가 필요해서, 로그인 정보를 읽는 부분은 Suspense 안에 둡니다 */}
      <Suspense fallback={<div className="h-[36rem]" />}>
        <NewPostForm />
      </Suspense>
    </AuthCard>
  );
}

async function NewPostForm() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/posts/new");

  return (
    <PostForm
      action={createPost}
      initial={{ title: "", price: "", description: "", status: "selling", images: [] }}
      submitLabel="등록하기"
      cancelHref="/"
      userId={user.id}
    />
  );
}
