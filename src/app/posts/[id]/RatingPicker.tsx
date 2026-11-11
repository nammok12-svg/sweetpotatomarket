"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ratePost } from "@/app/posts/actions";
import FaceIcon from "@/components/FaceIcon";
import { RATING_OPTIONS, type RatingSummary } from "@/lib/ratings";

/**
 * 상세 페이지의 "이 상품 어때요?" 얼굴 평가.
 * mode
 *  - "can"   : 로그인했고 남의 글 → 얼굴을 눌러 평가
 *  - "login" : 로그인 안 함 → 결과만 보여 주고 로그인 안내
 *  - "own"   : 내 글 → 결과만 (내 글은 평가 불가)
 */
export default function RatingPicker({
  postId,
  summary,
  mode,
}: {
  postId: number;
  summary: RatingSummary;
  mode: "can" | "login" | "own";
}) {
  return (
    <section className="mt-8 border-t border-line pt-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-bold">이 상품 어때요?</h2>
        <p className="text-xs text-muted">
          {summary.total > 0 ? `${summary.total}명이 평가했어요` : "아직 평가가 없어요"}
        </p>
      </div>

      {/* 버튼마다 name="score" value=점수 → 누른 버튼의 값만 서버 액션으로 전달됩니다 */}
      <form action={ratePost} className="mt-4">
        <input type="hidden" name="postId" value={postId} />
        <Faces summary={summary} clickable={mode === "can"} />
      </form>

      <p className="mt-3 text-center text-xs text-muted">
        {mode === "can" &&
          (summary.myScore
            ? "같은 얼굴을 한 번 더 누르면 평가가 취소돼요."
            : "얼굴을 눌러 평가해 주세요.")}
        {mode === "own" && "내 판매글은 평가할 수 없어요."}
        {mode === "login" && (
          <>
            <Link
              href={`/login?next=/posts/${postId}`}
              className="font-medium text-accent hover:underline"
            >
              로그인
            </Link>
            하고 평가에 참여해 보세요.
          </>
        )}
      </p>
    </section>
  );
}

function Faces({ summary, clickable }: { summary: RatingSummary; clickable: boolean }) {
  // useFormStatus: 바깥 <form> 이 서버에 전송 중인지 알려 줍니다 → 그동안 버튼을 잠시 잠급니다.
  const { pending } = useFormStatus();

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
      {RATING_OPTIONS.map(({ score, label }) => {
        const selected = summary.myScore === score;
        return (
          <button
            key={score}
            type="submit"
            name="score"
            value={score}
            disabled={!clickable || pending}
            aria-pressed={selected}
            aria-label={`${label} (${summary.counts[score]}명)`}
            className={`group flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 transition ${
              selected
                ? "border-accent bg-accent-soft"
                : "border-transparent enabled:hover:bg-background"
            } ${clickable ? "cursor-pointer" : "cursor-default"} disabled:opacity-100 ${
              pending ? "opacity-60" : ""
            }`}
          >
            <FaceIcon
              score={score}
              className={`h-11 w-11 transition-transform duration-200 sm:h-14 sm:w-14 ${
                clickable ? "group-hover:-translate-y-1 group-hover:scale-110" : ""
              } ${selected ? "scale-110" : ""}`}
            />
            <span
              className={`text-[11px] leading-tight sm:text-xs ${
                selected ? "font-bold text-accent-strong" : "text-muted"
              }`}
            >
              {label}
            </span>
            <span className="text-xs font-medium tabular-nums">{summary.counts[score]}</span>
          </button>
        );
      })}
    </div>
  );
}
