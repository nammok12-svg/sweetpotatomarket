import type { RatingScore } from "@/lib/ratings";

/**
 * 평가용 얼굴 아이콘 (직접 그린 SVG).
 * 이모지는 운영체제마다 모양이 달라서, 어디서나 같은 얼굴이 보이도록 SVG 로 그렸습니다.
 *
 * 공통 뼈대: 64×64 칸 안에 동그란 얼굴 → 점수마다 눈썹·눈·입·장식만 바뀝니다.
 *   5 매우 활짝 웃는 얼굴 · 4 웃는 얼굴 · 3 고민하는 얼굴 · 2 약간 화난 얼굴 · 1 아주 화난 얼굴
 */
export default function FaceIcon({
  score,
  className,
}: {
  score: RatingScore;
  className?: string;
}) {
  // 얼굴은 노랑 — 아주 화난 얼굴만 붉게
  const skin = score === 1 ? "var(--face-angry)" : "var(--face)";

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g stroke={line} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="32" cy="34" r="26" fill={skin} />
        {FEATURES[score]}
      </g>
    </svg>
  );
}

// 선(눈·입·테두리) 색 = 글자색
const line = "var(--foreground)";

const blush = (opacity: number) => (
  <g stroke="none" fill="var(--blush)" opacity={opacity}>
    <ellipse cx="15" cy="41" rx="4.5" ry="3" />
    <ellipse cx="49" cy="41" rx="4.5" ry="3" />
  </g>
);

const FEATURES: Record<RatingScore, React.ReactNode> = {
  // 5. 매우 활짝 웃는 얼굴: 눈은 ^ ^, 입은 크게 벌리고 혀까지, 볼 발그레
  5: (
    <>
      <path d="M17 31 Q22 23 27 31" />
      <path d="M37 31 Q42 23 47 31" />
      <path d="M17 38 Q32 60 47 38 Z" fill={line} />
      <path d="M25 49 Q32 44 39 49 Q32 55 25 49 Z" stroke="none" fill="var(--blush)" />
      {blush(0.75)}
    </>
  ),
  // 4. 웃는 얼굴: 동그란 눈 + 부드러운 미소
  4: (
    <>
      <circle cx="23" cy="30" r="3" fill={line} stroke="none" />
      <circle cx="41" cy="30" r="3" fill={line} stroke="none" />
      <path d="M21 41 Q32 51 43 41" />
      {blush(0.45)}
    </>
  ),
  // 3. 고민하는 얼굴: 한쪽 눈썹만 올라가고, 눈은 위를 보고, 입은 삐뚤삐뚤 + 생각 방울
  3: (
    <>
      <path d="M17 21 Q22 16 28 19" />
      <path d="M37 23 L46 22" />
      <circle cx="24" cy="29" r="3" fill={line} stroke="none" />
      <circle cx="42" cy="29" r="3" fill={line} stroke="none" />
      <path d="M24 45 Q28 42 32 45 Q36 48 40 44" />
      <circle cx="53" cy="11" r="2.4" fill="var(--surface)" strokeWidth="1.8" />
      <circle cx="59" cy="5" r="1.6" fill="var(--surface)" strokeWidth="1.6" />
    </>
  ),
  // 2. 약간 화난 얼굴: 안쪽으로 내려간 눈썹 + 살짝 처진 입
  2: (
    <>
      <path d="M18 22 L28 26" />
      <path d="M46 22 L36 26" />
      <circle cx="24" cy="32" r="3" fill={line} stroke="none" />
      <circle cx="40" cy="32" r="3" fill={line} stroke="none" />
      <path d="M23 47 Q32 41 41 47" />
    </>
  ),
  // 1. 아주 화난 얼굴: 굵고 날카로운 눈썹 + 이를 꽉 문 입 + 머리 위 '빠직' 표시
  1: (
    <>
      <path d="M15 20 L29 27" strokeWidth="3.6" />
      <path d="M49 20 L35 27" strokeWidth="3.6" />
      <circle cx="24" cy="33" r="3" fill={line} stroke="none" />
      <circle cx="40" cy="33" r="3" fill={line} stroke="none" />
      <rect x="20" y="41" width="24" height="10" rx="3" fill="var(--surface)" />
      <path d="M20 46 H44 M28 41 V51 M36 41 V51" strokeWidth="1.8" />
      <g stroke="var(--danger)" strokeWidth="2.4">
        <path d="M48 9 Q51 9 51 6" />
        <path d="M55 6 Q55 9 58 9" />
        <path d="M58 14 Q55 14 55 17" />
        <path d="M51 17 Q51 14 48 14" />
      </g>
    </>
  ),
};
