"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_BUCKET, MAX_IMAGES, publicImageUrl } from "@/lib/images";

const MAX_SIDE = 1600; // 긴 변 최대 1600px 로 줄여서 올립니다

/**
 * 사진 여러 장 고르기 + 업로드.
 * 사진을 고르는 즉시 Storage 에 올리고, 올라간 "경로" 목록만 부모(PostForm)에 알려 줍니다.
 * 실제 글 저장은 부모 폼이 경로 목록을 서버 액션으로 보낼 때 이루어집니다.
 */
export default function ImagePicker({
  userId,
  paths,
  savedPaths,
  onChange,
  onUploadingChange,
}: {
  userId: string;
  paths: string[];
  /** 이미 DB에 저장된 사진 (수정 화면). 이 사진들은 '저장'을 눌러야 실제로 지웁니다. */
  savedPaths: string[];
  onChange: (paths: string[]) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");

    const room = MAX_IMAGES - paths.length;
    const files = Array.from(fileList).slice(0, room);
    if (fileList.length > room) {
      setError(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
    }

    setUploadingCount(files.length);
    onUploadingChange(true);

    const supabase = createClient();
    const uploaded: string[] = [];

    // 한 장씩 차례로 올립니다 (고른 순서 = 사진 순서)
    for (const file of files) {
      try {
        const { blob, ext } = await shrinkImage(file);
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, blob, { contentType: blob.type });
        if (error) throw error;
        uploaded.push(path);
      } catch {
        setError(`"${file.name}" 을(를) 올리지 못했어요. (5MB 이하의 jpg/png/webp/gif 만 가능)`);
      }
      setUploadingCount((n) => n - 1);
    }

    onChange([...paths, ...uploaded]);
    onUploadingChange(false);
    // 같은 파일을 다시 고를 수 있도록 입력값을 비웁니다
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(path: string) {
    onChange(paths.filter((p) => p !== path));
    // 이번에 새로 올린 사진이면 Storage 에서도 바로 지웁니다.
    // 원래 저장돼 있던 사진은 '취소'할 수도 있으니, 서버 액션이 저장할 때 지웁니다.
    if (!savedPaths.includes(path)) {
      createClient().storage.from(IMAGE_BUCKET).remove([path]);
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">
        사진 <span className="text-muted">({paths.length}/{MAX_IMAGES})</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {/* 사진 추가 버튼 — 실제 파일 입력창은 숨기고 이 버튼으로 엽니다 */}
        {paths.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadingCount > 0}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-background text-xs text-muted transition hover:border-accent hover:text-accent disabled:opacity-60"
          >
            <span className="text-2xl leading-none">+</span>
            {uploadingCount > 0 ? `올리는 중 ${uploadingCount}` : "사진 추가"}
          </button>
        )}

        {paths.map((path, i) => (
          <div key={path} className="relative h-20 w-20 overflow-hidden rounded-lg border border-line">
            <Image src={publicImageUrl(path)} alt="" fill sizes="80px" className="object-cover" />
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-foreground/70 py-0.5 text-center text-[11px] text-white">
                대표 사진
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(path)}
              aria-label="사진 삭제"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/70 text-xs text-white hover:bg-foreground"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted">첫 번째 사진이 목록에 보이는 대표 사진이 됩니다.</p>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

/**
 * 휴대폰 사진은 수 MB 라서 올리기 전에 브라우저에서 줄입니다.
 * canvas 에 작게 다시 그린 뒤 JPEG 로 저장하는 방식입니다.
 * (움직이는 GIF 는 그리면 멈춘 그림이 되므로 그대로 올립니다)
 */
async function shrinkImage(file: File): Promise<{ blob: Blob; ext: "jpg" | "gif" }> {
  if (file.type === "image/gif") return { blob: file, ext: "gif" };

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("변환 실패"))), "image/jpeg", 0.85),
  );
  return { blob, ext: "jpg" };
}
