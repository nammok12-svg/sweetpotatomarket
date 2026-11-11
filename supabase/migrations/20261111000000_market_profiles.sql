-- 고구마마켓 회원 프로필 (auth.users 와 1:1)
-- 가계부와 같은 DB를 쓰므로 모든 고구마마켓 테이블에는 market_ 접두사를 붙입니다.
-- (이 SQL은 이미 Supabase에 적용되어 있습니다. 기록/학습용 사본입니다.)
create table public.market_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 12),
  region text not null default '' check (char_length(region) <= 30),
  created_at timestamptz not null default now()
);

alter table public.market_profiles enable row level security;

-- 누구나 닉네임/동네 조회 가능 (판매자 정보 표시용)
create policy "market_profiles select all"
  on public.market_profiles for select
  to anon, authenticated
  using (true);

-- 본인 프로필만 수정
create policy "market_profiles update own"
  on public.market_profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 회원가입 시 메타데이터의 nickname/region 으로 프로필 자동 생성
create or replace function public.market_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ? 'nickname' then
    insert into public.market_profiles (id, nickname, region)
    values (
      new.id,
      new.raw_user_meta_data ->> 'nickname',
      coalesce(new.raw_user_meta_data ->> 'region', '')
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.market_handle_new_user() from public, anon, authenticated;

create trigger market_on_auth_user_created
  after insert on auth.users
  for each row execute function public.market_handle_new_user();
