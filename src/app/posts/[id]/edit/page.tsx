import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { getCurrentUser } from "@/lib/auth";
import { getPost, parsePostId } from "@/lib/posts";
import { updatePost } from "@/app/posts/actions";
import PostForm from "@/app/posts/PostForm";

export const metadata: Metadata = { title: "판매글 수정 · 고구마마켓" };

export default function EditPostPage({ params }: PageProps<"/posts/[id]/edit">) {
  return (
    <AuthCard title="판매글 수정" subtitle="내용이나 판매 상태를 바꿀 수 있어요.">
      <Suspense fallback={<div className="h-96" />}>
        <EditForm params={params} />
      </Suspense>
    </AuthCard>
  );
}

async function EditForm({ params }: { params: PageProps<"/posts/[id]/edit">["params"] }) {
  const id = parsePostId((await params).id);
  if (id === null) notFound();

  const [post, user] = await Promise.all([getPost(id), getCurrentUser()]);
  if (!post) notFound();
  // 남의 글 수정 화면에 들어오면 상세 페이지로 돌려보냅니다.
  if (user?.id !== post.seller_id) redirect(`/posts/${id}`);

  return (
    <PostForm
      action={updatePost}
      initial={{
        id: post.id,
        title: post.title,
        price: String(post.price),
        description: post.description,
        status: post.status,
        images: post.image_paths,
      }}
      submitLabel="수정 완료"
      cancelHref={`/posts/${id}`}
      userId={post.seller_id}
    />
  );
}
