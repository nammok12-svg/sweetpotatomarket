"use client";

import Image from "next/image";
import { useState } from "react";

/** 상세 화면 사진: 큰 사진 하나 + 아래 작은 사진을 누르면 큰 사진이 바뀝니다. */
export default function Gallery({ urls, title }: { urls: string[]; title: string }) {
  const [current, setCurrent] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
        <Image
          src={urls[current]}
          alt={`${title} 사진 ${current + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, 600px"
          className="object-contain"
          preload={current === 0}
        />
        {urls.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-foreground/60 px-2.5 py-0.5 text-xs text-white">
            {current + 1} / {urls.length}
          </span>
        )}
      </div>

      {urls.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`사진 ${i + 1} 보기`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === current ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
