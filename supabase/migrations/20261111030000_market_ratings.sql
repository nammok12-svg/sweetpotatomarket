-- 고구마마켓: 판매글 평가 (얼굴 아이콘 5단계)
-- (이 SQL은 이미 Supabase에 적용되어 있습니다. 기록/학습용 사본입니다.)
-- score: 5 아주 좋아요 · 4 좋아요 · 3 그럭저럭 · 2 별루 · 1 아주 별루
create table public.market_ratings (
  post_id bigint not null references public.market_posts(id) on delete cascade,
  user_id uuid not null default auth.uid()
    references public.market_profiles(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- (글, 사람) 조합이 기본키 → 한 사람은 한 글에 평가를 하나만 남길 수 있습니다.
  primary key (post_id, user_id)
);

-- 기본키가 post_id 로 시작하므로 post_id 조회는 이미 빠릅니다. user_id 외래키용 인덱스만 추가.
create index market_ratings_user_id_idx on public.market_ratings (user_id);

alter table public.market_ratings enable row level security;

-- 평가 결과는 누구나 볼 수 있음
create policy "market_ratings select all"
  on public.market_ratings for select
  to anon, authenticated
  using (true);

-- 평가 남기기/바꾸기: 본인 이름으로만, 그리고 내 글에는 평가할 수 없음
create policy "market_ratings insert own"
  on public.market_ratings for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and not exists (
      select 1 from public.market_posts p
      where p.id = post_id and p.seller_id = (select auth.uid())
    )
  );

create policy "market_ratings update own"
  on public.market_ratings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and not exists (
      select 1 from public.market_posts p
      where p.id = post_id and p.seller_id = (select auth.uid())
    )
  );

-- 평가 취소: 본인 것만
create policy "market_ratings delete own"
  on public.market_ratings for delete
  to authenticated
  using ((select auth.uid()) = user_id);
