<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 고구마마켓 — 에이전트 작업 규칙

당근마켓 같은 동네 중고거래 사이트. **개발 공부용 프로젝트**입니다.

## 1. 진행 방식: 한 번에 한 단계씩

- 사용자가 요청한 **그 단계만** 구현합니다. 다음 단계 기능을 미리 만들거나 범위를 넓히지 마세요.
- 단계가 끝나면 무엇을 만들었는지, **어떤 파일부터 읽으면 좋은지** 짧게 안내하고 다음 단계는 제안만 합니다.
- 공부용이므로 코드는 단순하고 읽기 쉽게, 핵심 부분에는 **한국어 주석**으로 "왜 이렇게 하는지"를 적습니다.
- 낯선 라이브러리·추상화를 새로 들이기 전에 먼저 물어봅니다.
- 진행 상황은 `README.md`의 "진행 단계" 체크리스트에 반영합니다.

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 회원가입 / 로그인 / 로그아웃 | 완료 |
| 2 | 판매글 CRUD (사진 제외) | 완료 |
| 3 | 판매글 사진 업로드 (여러 장) | 완료 |

## 2. Supabase: 가계부와 같은 프로젝트를 재사용 중 ⚠️

- 프로젝트 ref: `jyhzbsjwxkvunwoladye` — 이전에 만든 **가계부(`simple-ledger`) 앱과 공유**합니다.
- 가계부 테이블 `public.transactions` 와 그 RLS 정책(anon 읽기/쓰기/삭제)은 **절대 수정·삭제하지 마세요.** 가계부 앱이 로그인 없이 그대로 씁니다.
- 고구마마켓의 모든 DB 객체에는 **`market_` 접두사**를 붙입니다. (테이블, 함수, 트리거, Storage 버킷 등)
  - 현재: `market_profiles`, `market_posts`, `market_handle_new_user()`, `market_on_auth_user_created` 트리거, Storage 버킷 `market_post_images`
- `auth.users` 는 두 앱이 함께 쓰는 공간입니다. Auth 설정(이메일 인증 on/off, Site URL 등)을 바꾸면 가계부에도 영향이 갈 수 있으니 **바꾸기 전에 사용자에게 확인**합니다.
  - 현재 이메일 인증은 **꺼져 있음** → 가입하면 바로 로그인됨.
- 스키마 변경 순서:
  1. 먼저 기존 테이블을 확인하고
  2. 마이그레이션을 적용한 뒤
  3. 같은 SQL을 `supabase/migrations/YYYYMMDDHHMMSS_이름.sql` 로 저장하고
  4. 보안 advisor 를 확인합니다.
- 새 테이블은 항상 **RLS 를 켜고** 정책을 함께 만듭니다.
- 테스트로 만든 계정·데이터는 작업이 끝나면 지웁니다.

## 3. 키와 환경변수

- `.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 가 있습니다. (git 제외, 예시는 `.env.example`)
- publishable 키만 씁니다. **`service_role` / secret 키는 코드나 저장소에 넣지 마세요.** 저장소가 **공개(public)** 입니다.

## 4. 코드 규칙

- 서버에서 로그인 확인은 `getClaims()` 를 씁니다. (`getSession()` 은 서버에서 믿으면 안 됨)
- 현재 사용자 정보는 `src/lib/auth.ts` 의 `getCurrentUser()` 를 재사용합니다.
- Cache Components 가 켜져 있으므로 쿠키·로그인 상태를 읽는 컴포넌트는 `<Suspense>` 안에 둡니다.
- `middleware` 대신 `src/proxy.ts` 를 씁니다.
- 디자인: 화려하지 않고 품격 있게. 아이보리 바탕 + 고구마색(`accent`) 포인트, 제목은 명조체(`font-serif`). 색은 `globals.css` 의 토큰만 사용합니다.
- 작업 후 `npx tsc --noEmit`, `npm run lint`, `npm run build` 를 통과시키고, 화면이 바뀌면 브라우저로 직접 확인합니다.

## 5. 배포와 git

- GitHub: `nammok12-svg/sweetpotatomarket` (공개), 기본 브랜치 `main`.
- Vercel: `leeinho/sweetpotatomarket` → https://sweetpotatomarket.vercel.app (가계부와 **다른 링크**)
  - GitHub 와 연결되어 있어 **`main` 에 push 하면 자동 배포**됩니다.
  - Supabase 환경변수는 Vercel 의 Production/Preview/Development 에 등록되어 있습니다. 새 환경변수가 생기면 Vercel 에도 추가해야 합니다.
- 커밋과 push 는 사용자가 요청할 때만 합니다.

## 6. 이 PC 환경 메모 (Windows)

- Node.js 는 이 프로젝트를 시작하면서 winget 으로 설치했습니다. 셸에서 `node` 를 못 찾으면 `C:\Program Files\nodejs` 를 PATH 앞에 붙여 실행합니다.
- Vercel CLI 는 전역 설치본이 사용자 터미널에서 보이지 않아서, **사용자 터미널에서 `npx vercel@<버전> ...`** 으로 실행합니다. (로그인 정보도 사용자 터미널 쪽에 있음)
- 로그인·인증처럼 사용자 본인이 해야 하는 일은 사용자 터미널에서 직접 하도록 안내합니다.
