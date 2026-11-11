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

export type RatingSummary = {
  /** 점수별 인원. 예: { 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 } */
  counts: Record<RatingScore, number>;
  total: number;
  /** 로그인한 내가 고른 점수 (안 골랐으면 null) */
  myScore: RatingScore | null;
};
