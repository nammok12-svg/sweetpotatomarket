-- 고구마마켓 판매글 (2단계: 판매글 CRUD, 사진은 다음 단계)
-- 가계부와 같은 DB를 쓰므로 market_ 접두사를 붙입니다.
-- (이 SQL은 이미 Supabase에 적용되어 있습니다. 기록/학습용 사본입니다.)
create table public.market_posts (
  id bigint generated always as identity primary key,
  -- 글쓴이. 기본값 auth.uid() → 로그인한 사람 id 가 자동으로 들어갑니다.
  -- market_profiles 를 참조해야 목록에서 닉네임/동네를 함께 불러올 수 있습니다.
  seller_id uuid not null default auth.uid()
    references public.market_profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 40),
  price integer not null check (price >= 0 and price <= 100000000), -- 0원 = 나눔
  description text not null default '' check (char_length(description) <= 2000),
  status text not null default 'selling'
    check (status in ('selling', 'reserved', 'sold')), -- 판매중/예약중/거래완료
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 외래키·정렬 컬럼 인덱스 (성능 advisor 권장)
create index market_posts_seller_id_idx on public.market_posts (seller_id);
create index market_posts_created_at_idx on public.market_posts (created_at desc);

alter table public.market_posts enable row level security;

-- 누구나(비로그인 포함) 판매글을 볼 수 있음
create policy "market_posts select all"
  on public.market_posts for select
  to anon, authenticated
  using (true);

-- 글쓰기·수정·삭제는 본인 글만
create policy "market_posts insert own"
  on public.market_posts for insert
  to authenticated
  with check ((select auth.uid()) = seller_id);

create policy "market_posts update own"
  on public.market_posts for update
  to authenticated
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);

create policy "market_posts delete own"
  on public.market_posts for delete
  to authenticated
  using ((select auth.uid()) = seller_id);
