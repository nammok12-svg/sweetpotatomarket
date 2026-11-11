-- 고구마마켓 3단계: 판매글 사진 (여러 장)
-- (이 SQL은 이미 Supabase에 적용되어 있습니다. 기록/학습용 사본입니다.)

-- 1) 판매글에 사진 경로 목록을 배열로 저장합니다. 배열 순서 = 사진 순서, 첫 장이 대표 사진.
--    별도 테이블 대신 배열을 쓴 이유: 글과 사진이 항상 함께 다니고, 최대 10장이라 단순한 쪽을 택했습니다.
alter table public.market_posts
  add column image_paths text[] not null default '{}'
    check (cardinality(image_paths) <= 10);

-- 2) 사진 파일을 담을 Storage 버킷
--    public = true → 주소만 알면 누구나 사진을 볼 수 있음 (판매글은 공개 정보이므로)
--    한 장 최대 5MB, 이미지 형식만 허용
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('market_post_images', 'market_post_images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- 3) 업로드·삭제는 "내 폴더"에만. 파일 경로는 항상 "{내 user id}/파일이름" 입니다.
--    storage.foldername(name)[1] = 경로의 첫 번째 폴더 이름
create policy "market_post_images insert own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'market_post_images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 삭제(remove)할 때 Storage 가 내부적으로 조회도 하므로 select 정책이 필요합니다.
-- 공개 버킷의 사진 보기는 이 정책과 상관없이 공개 주소로 됩니다.
-- (모두에게 select 를 열면 버킷 전체 파일 목록을 누구나 볼 수 있게 되므로 내 폴더로만 제한)
create policy "market_post_images select own folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'market_post_images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "market_post_images delete own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'market_post_images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
