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
- [x] 2단계: 판매글 CRUD (쓰기·목록·상세·수정·삭제, 사진 제외)
- [x] 3단계: 판매글 사진 업로드 (여러 장, 최대 10장)
- [ ] …

## 폴더 구조

```
src/
├─ proxy.ts                  # 모든 요청 전에 로그인 세션(토큰) 갱신 (구 middleware)
├─ lib/
│  ├─ auth.ts                # getCurrentUser() — 현재 로그인 사용자 + 프로필
│  ├─ posts.ts               # getPosts() / getPost() — 판매글 조회 + 가격·날짜 표시 도우미
│  ├─ images.ts              # 사진 버킷 이름, 공개 주소 만들기, 경로 검사
│  └─ supabase/
│     ├─ server.ts           # 서버용 Supabase 클라이언트
│     ├─ client.ts           # 브라우저용 Supabase 클라이언트 (사진 업로드)
│     └─ proxy.ts            # proxy.ts 에서 쓰는 세션 갱신 로직
├─ app/
│  ├─ layout.tsx             # 공통 레이아웃 (헤더/푸터, 폰트)
│  ├─ page.tsx               # 홈 (최근 판매글 목록)
│  ├─ posts/
│  │  ├─ actions.ts          # 서버 액션: createPost / updatePost / deletePost
│  │  ├─ PostForm.tsx        # 글쓰기·수정 공용 폼 (클라이언트 컴포넌트)
│  │  ├─ ImagePicker.tsx     # 사진 여러 장 고르기 → 줄이기 → Storage 업로드
│  │  ├─ new/page.tsx        # /posts/new — 판매글 쓰기
│  │  └─ [id]/               # /posts/1 상세(+사진 Gallery, 삭제 버튼), /posts/1/edit 수정
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
  - `market_posts` — 판매글 (제목·가격·설명·상태·사진 경로 `image_paths`). 읽기는 누구나, 쓰기·수정·삭제는 본인만 (RLS)
  - Storage 버킷 `market_post_images` — 판매글 사진. 공개 읽기, 업로드·삭제는 `{내 user id}/` 폴더에만
- 회원가입 시 DB 트리거(`market_on_auth_user_created`)가 프로필을 자동 생성합니다.

## 공부 포인트

1. **서버 액션 + useActionState** — 폼을 서버 함수로 바로 보내고, 에러 메시지를 상태로 받습니다.
2. **쿠키 기반 세션** — `@supabase/ssr` 가 로그인 토큰을 쿠키에 저장 → 서버에서도 로그인 여부를 압니다.
3. **getClaims()** — 서버에서는 `getSession()` 대신 토큰을 검증하는 `getClaims()` 를 씁니다.
4. **RLS** — `market_profiles` 는 누구나 읽기 가능, 수정은 본인만.
5. **Cache Components** — 로그인 상태처럼 요청마다 다른 부분은 `<Suspense>` 안에 둡니다.
6. **CRUD 권한은 세 겹** — 화면(본인 글에만 수정/삭제 버튼) → 서버 액션(로그인·작성자 확인) → RLS(DB가 최종 차단).
   화면만 막으면 직접 POST 요청으로 뚫릴 수 있어서 서버와 DB에서도 확인합니다.
7. **사진은 브라우저 → Storage 직행** — 서버를 거치면 Vercel 요청 크기 제한(4.5MB)에 걸려서,
   브라우저가 사진을 줄여(긴 변 1600px JPEG) 바로 올리고, 서버 액션에는 "경로 문자열"만 보냅니다.
   글에서 빠진 사진·삭제된 글의 사진은 서버 액션이 Storage 에서도 지웁니다.

## 배포 시 체크 (나중에)

- Vercel 등에 가계부와 **다른 링크로** 배포
- Supabase 대시보드 → Authentication → URL Configuration → **Redirect URLs** 에
  `http://localhost:3000/**` 와 배포 주소 `https://<배포주소>/**` 추가
  (이메일 인증을 켤 경우 인증 링크가 이 주소로 돌아옵니다)
