import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  nickname: string;
  region: string;
};

/**
 * 현재 로그인한 사용자와 프로필을 가져옵니다. 로그인 안 했으면 null.
 * React cache() 덕분에 한 요청 안에서 여러 번 불러도 DB 조회는 한 번만 합니다.
 *
 * 쿠키를 읽으므로, 이 함수를 쓰는 컴포넌트는 반드시 <Suspense> 안에 두어야 합니다.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // "이 부분은 요청 시점에 실행한다"고 Next.js에 알립니다.
  // (Supabase가 토큰 만료를 검사하며 현재 시각을 쓰기 때문에 필요)
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: profile } = await supabase
    .from("market_profiles")
    .select("nickname, region")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: String(claims.email ?? ""),
    nickname: profile?.nickname ?? "회원",
    region: profile?.region ?? "",
  };
});
