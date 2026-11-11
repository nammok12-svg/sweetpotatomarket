import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 모든 요청 전에 실행되어 만료된 로그인 세션(토큰)을 갱신합니다.
 * 갱신된 쿠키는 요청(서버 컴포넌트용)과 응답(브라우저용) 양쪽에 써 줍니다.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // getClaims() 가 토큰을 검증하고, 필요하면 갱신합니다. 지우지 마세요.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;

  // 로그인한 사용자가 로그인/회원가입 페이지에 오면 홈으로 보냅니다.
  const path = request.nextUrl.pathname;
  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 글쓰기·수정 페이지는 로그인이 필요합니다. 로그인 후 원래 페이지로 돌아오도록 next 를 붙입니다.
  // (화면 이동용 1차 확인일 뿐, 실제 권한 확인은 서버 액션과 RLS 가 합니다)
  const needsLogin = path === "/posts/new" || /^\/posts\/[^/]+\/edit$/.test(path);
  if (!isLoggedIn && needsLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  return response;
}
