// 판매글 사진 관련 상수와 도우미.
// 서버·클라이언트 양쪽에서 쓰므로 "server-only" 를 붙이지 않습니다.

export const IMAGE_BUCKET = "market_post_images";
export const MAX_IMAGES = 10;

/**
 * Storage 안의 경로("{userId}/{uuid}.jpg") → 브라우저에서 볼 수 있는 공개 주소.
 * 공개 버킷이라 주소 규칙이 정해져 있어서 Supabase 클라이언트 없이 문자열로 만들 수 있습니다.
 */
export function publicImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

/**
 * 폼으로 넘어온 경로가 "이 사용자 폴더 안의, 우리가 만든 형식의 파일"인지 확인합니다.
 * 서버 액션에서 남의 사진 경로를 끼워 넣는 것을 막기 위함입니다.
 */
export function isOwnImagePath(path: string, userId: string) {
  return new RegExp(`^${userId}/[0-9a-f-]{36}\\.(jpg|gif)$`).test(path);
}
