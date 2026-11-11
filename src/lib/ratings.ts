// 평가 5단계 — 화면(클라이언트)과 서버에서 함께 쓰므로 "server-only" 를 붙이지 않습니다.
// score 숫자는 DB의 market_ratings.score 와 같습니다. (5가 가장 좋음)

export type RatingScore = 1 | 2 | 3 | 4 | 5;

export const RATING_OPTIONS: { score: RatingScore; label: string }[] = [
  { score: 5, label: "아주 좋아요" },
  { score: 4, label: "좋아요" },
  { score: 3, label: "그럭저럭이예요" },
  { score: 2, label: "별루예요" },
  { score: 1, label: "아주 별루예요" },
];

/** 점수 → 이름표. 예: 4 → "좋아요" */
export function ratingLabel(score: RatingScore) {
  return RATING_OPTIONS.find((o) => o.score === score)!.label;
}

/**
 * 목록용 한 줄 요약: 평균 점수를 반올림해서 "대표 얼굴" 하나로 보여 줍니다.
 * 평가가 없으면 null.
 */
export function summarizeScores(scores: number[]): { face: RatingScore; count: number } | null {
  if (scores.length === 0) return null;
  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return { face: Math.round(average) as RatingScore, count: scores.length };
}

export type RatingSummary = {
  /** 점수별 인원. 예: { 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 } */
  counts: Record<RatingScore, number>;
  total: number;
  /** 로그인한 내가 고른 점수 (안 골랐으면 null) */
  myScore: RatingScore | null;
};
