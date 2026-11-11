import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  formatDate,
  formatPrice,
  getPost,
  getRatingSummary,
  parsePostId,
  STATUS_LABEL,
} from "@/lib/posts";
import RatingPicker from "./RatingPicker";
import StatusBadge from "@/components/StatusBadge";
import { publicImageUrl } from "@/lib/images";
import DeleteButton from "./DeleteButton";
import Gallery from "./Gallery";

export default function PostPage({ params }: PageProps<"/posts/[id]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← 목록으로
      </Link>
      {/* 주소의 id 와 DB 조회는 요청 시점에 정해지므로 Suspense 안에서 처리합니다 */}
      <Suspense fallback={<div className="mt-6 h-80 animate-pulse rounded-xl bg-line/40" />}>
        <PostDetail params={params} />
      </Suspense>
    </div>
  );
}

async function PostDetail({ params }: { params: PageProps<"/posts/[id]">["params"] }) {
  const id = parsePostId((await params).id);
  if (id === null) notFound();

  const user = await getCurrentUser();
  // 글과 평가 요약은 서로 기다릴 필요가 없어서 동시에 불러옵니다.
  const [post, ratings] = await Promise.all([
    getPost(id),
    getRatingSummary(id, user?.id ?? null),
  ]);
  if (!post) notFound();

  const isOwner = user?.id === post.seller_id;

  return (
    <article className="mt-6 rounded-xl border border-line bg-surface p-6 sm:p-8">
      {post.image_paths.length > 0 && (
        <div className="mb-6">
          <Gallery urls={post.image_paths.map(publicImageUrl)} title={post.title} />
        </div>
      )}

      {/* 판매자 */}
      <div className="flex items-center justify-between border-b border-line pb-5">
        <div>
          <p className="font-medium">{post.seller?.nickname ?? "알 수 없음"}</p>
          <p className="text-sm text-muted">{post.seller?.region || "동네 미설정"}</p>
        </div>
        <StatusBadge status={post.status} />
      </div>

      <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {formatDate(post.created_at)} · {STATUS_LABEL[post.status]}
      </p>
      <p className="mt-4 text-xl font-bold">{formatPrice(post.price)}</p>

      {/* whitespace-pre-wrap: 사용자가 입력한 줄바꿈을 그대로 보여 줍니다 */}
      <p className="mt-6 leading-relaxed whitespace-pre-wrap">
        {post.description || <span className="text-muted">설명이 없습니다.</span>}
      </p>

      <RatingPicker
        postId={post.id}
        summary={ratings}
        mode={!user ? "login" : isOwner ? "own" : "can"}
      />

      {/* 본인 글일 때만 수정/삭제 버튼 (실제 권한은 서버 액션 + RLS 가 지킵니다) */}
      {isOwner && (
        <div className="mt-8 flex justify-end gap-2 border-t border-line pt-5">
          <Link
            href={`/posts/${post.id}/edit`}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm transition hover:border-foreground/30"
          >
            수정
          </Link>
          <DeleteButton id={post.id} />
        </div>
      )}
    </article>
  );
}
