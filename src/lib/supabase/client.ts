import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저(클라이언트 컴포넌트)에서 쓰는 Supabase 클라이언트.
 * 로그인 쿠키를 그대로 읽으므로, 여기서 업로드하면 "로그인한 나"로서 Storage 정책(RLS)을 통과합니다.
 *
 * 사진은 서버 액션을 거치지 않고 브라우저 → Supabase 로 바로 올립니다.
 * (Vercel 은 요청 하나에 4.5MB 까지만 받아서, 사진 여러 장을 서버로 보내면 막히기 때문)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
