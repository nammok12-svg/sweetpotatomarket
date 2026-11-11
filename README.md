# 🍠 고구마마켓

우리 동네 중고거래 웹사이트 (개발 공부용, 단계별 진행)

- **Next.js 16** (App Router, Server Actions, Cache Components)
- **Supabase** (Auth + Postgres) — 가계부와 같은 프로젝트를 공유합니다
- **Tailwind CSS 4**

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속. 환경변수는 `.env.local` (예시: `.env.example`).

## 진행 단계

- [x] 1단계: 회원가입 / 로그인 / 로그아웃
- [ ] 2단계: 상품 등록·목록
- [ ] 3단계: 상품 상세·이미지 업로드
- [ ] …

## 폴더 구조

```
src/
├─ proxy.ts                  # 모든 요청 전에 로그인 세션(토큰) 갱신 (구 middleware)
├─ lib/
│  ├─ auth.ts                # getCurrentUser() — 현재 로그인 사용자 + 프로필
│  └─ supabase/
│     ├─ server.ts           # 서버용 Supabase 클라이언트
│     └─ proxy.ts            # proxy.ts 에서 쓰는 세션 갱신 로직
├─ app/
│  ├─ layout.tsx             # 공통 레이아웃 (헤더/푸터, 폰트)
│  ├─ page.tsx               # 홈
│  ├─ login/                 # 로그인 페이지 + 폼(클라이언트 컴포넌트)
│  ├─ signup/                # 회원가입 페이지 + 폼
│  └─ auth/
│     ├─ actions.ts          # 서버 액션: signup / login / logout
│     └─ callback/route.ts   # 이메일 인증 링크가 돌아오는 곳
└─ components/               # Header, Logo, Field, SubmitButton 등
supabase/migrations/         # DB에 적용한 SQL 기록
```

## DB 규칙 (가계부와 공유)

- 가계부 테이블: `transactions`
- 고구마마켓 테이블은 모두 **`market_` 접두사** 를 붙입니다.
  - `market_profiles` — 회원 닉네임·동네 (auth.users 와 1:1)
- 회원가입 시 DB 트리거(`market_on_auth_user_created`)가 프로필을 자동 생성합니다.

## 공부 포인트

1. **서버 액션 + useActionState** — 폼을 서버 함수로 바로 보내고, 에러 메시지를 상태로 받습니다.
2. **쿠키 기반 세션** — `@supabase/ssr` 가 로그인 토큰을 쿠키에 저장 → 서버에서도 로그인 여부를 압니다.
3. **getClaims()** — 서버에서는 `getSession()` 대신 토큰을 검증하는 `getClaims()` 를 씁니다.
4. **RLS** — `market_profiles` 는 누구나 읽기 가능, 수정은 본인만.
5. **Cache Components** — 로그인 상태처럼 요청마다 다른 부분은 `<Suspense>` 안에 둡니다.

## 배포 시 체크 (나중에)

- Vercel 등에 가계부와 **다른 링크로** 배포
- Supabase 대시보드 → Authentication → URL Configuration → **Redirect URLs** 에
  `http://localhost:3000/**` 와 배포 주소 `https://<배포주소>/**` 추가
  (이메일 인증을 켤 경우 인증 링크가 이 주소로 돌아옵니다)
