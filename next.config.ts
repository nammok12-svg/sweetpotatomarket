import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // next/image 로 Supabase Storage 의 판매글 사진을 보여 주려면 주소를 허용해야 합니다.
  // (허용 목록이 없으면 아무 사이트의 이미지나 우리 서버로 변환시킬 수 있게 되므로 Next.js 가 막아 둠)
  images: {
    remotePatterns: [
      new URL(
        "https://jyhzbsjwxkvunwoladye.supabase.co/storage/v1/object/public/market_post_images/**",
      ),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
