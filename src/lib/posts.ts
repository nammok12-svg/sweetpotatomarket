import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RatingScore, RatingSummary } from "@/lib/ratings";

/** 판매 상태 — DB의 check 제약과 같은 값만 씁니다. */
export const POST_STATUSES = ["selling", "reserved", "sold"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const STATUS_LABEL: Record<PostStatus, string> = {
  selling: "판매중",
  reserved: "예약중",
  sold: "거래완료",
};

export type Post = {
  id: number;
  seller_id: string;
  title: string;
  price: number;
  description: string;
  status: PostStatus;
  created_at: string;
  /** Storage 안의 사진 경로들. 첫 번째가 대표 사진. */
  image_paths: string[];
  // market_profiles 와 조인해서 함께 가져온 판매자 정보
  seller: { nickname: string; region: string } | null;
};

// select 문자열 안의 "seller:market_profiles!market_posts_seller_id_fkey(...)" 는
// "seller_id 외래키를 따라가서 프로필을 seller 라는 이름으로 붙여 달라"는 뜻입니다.
// !외래키이름 을 꼭 적어야 합니다: market_ratings 테이블도 글과 프로필을 이어 주기 때문에
// 이름을 안 적으면 Supabase 가 "길이 두 개라 어느 쪽인지 모르겠다"며 에러를 냅니다.
const POST_COLUMNS =
  "id, seller_id, title, price, description, status, created_at, image_paths, seller:market_profiles!market_posts_seller_id_fkey(nickname, region)";

/**
 * 판매글 목록 (최신순).
 * 쿠키를 읽는 Supabase 클라이언트를 쓰므로 <Suspense> 안에서 불러야 합니다.
 */
export async function getPosts(): Promise<Post[]> {
  // auth.ts 의 getCurrentUser() 와 같은 이유: Supabase 가 토큰 만료를 검사하며
  // 현재 시각을 쓰므로, "요청 시점에 실행"한다고 먼저 알려 줍니다.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_posts")
    .select(POST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`판매글을 불러오지 못했습니다: ${error.message}`);
  return (data ?? []) as unknown as Post[];
}

/** 판매글 하나. 없으면 null. */
export async function getPost(id: number): Promise<Post | null> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_posts")
    .select(POST_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`판매글을 불러오지 못했습니다: ${error.message}`);
  return data as unknown as Post | null;
}

/**
 * 판매글 하나의 평가 요약 (점수별 인원 + 내가 고른 점수).
 * 평가 수가 많지 않은 공부용 앱이라 행을 모두 가져와 서버에서 셉니다.
 */
export async function getRatingSummary(
  postId: number,
  userId: string | null,
): Promise<RatingSummary> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_ratings")
    .select("score, user_id")
    .eq("post_id", postId);
  if (error) throw new Error(`평가를 불러오지 못했습니다: ${error.message}`);

  const counts: RatingSummary["counts"] = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let myScore: RatingScore | null = null;
  for (const row of data ?? []) {
    const score = row.score as RatingScore;
    counts[score] += 1;
    if (row.user_id === userId) myScore = score;
  }
  return { counts, total: data?.length ?? 0, myScore };
}

/** 주소의 [id] 를 숫자로. 숫자가 아니면 null → 페이지에서 notFound() */
export function parsePostId(raw: string): number | null {
  return /^\d{1,15}$/.test(raw) ? Number(raw) : null;
}

/** 15000 → "15,000원", 0 → "나눔" */
export function formatPrice(price: number) {
  return price === 0 ? "나눔" : `${price.toLocaleString("ko-KR")}원`;
}

/** 작성일 표시. 서버(Vercel)는 UTC 라서 한국 시간대를 명시합니다. */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
