"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { POST_STATUSES, type PostStatus } from "@/lib/posts";
import { IMAGE_BUCKET, MAX_IMAGES, isOwnImagePath } from "@/lib/images";

export type PostFormState = {
  error?: string;
  fields?: Record<string, string>;
};

type PostInput = {
  title: string;
  price: number;
  description: string;
  status: PostStatus;
  image_paths: string[];
};

/**
 * 폼 입력값 검사. 통과하면 { input }, 아니면 { error } 를 돌려줍니다.
 * DB에도 같은 check 제약이 있지만, 사용자에게 친절한 메시지를 주려고 여기서 먼저 검사합니다.
 */
function readPostForm(
  formData: FormData,
  userId: string,
):
  | { input: PostInput; fields: Record<string, string> }
  | { error: string; fields: Record<string, string> } {
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").replaceAll(",", "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "selling");
  // 같은 이름(images)으로 여러 개 온 값은 getAll 로 배열로 받습니다. Set 으로 중복 제거.
  const imagePaths = [...new Set(formData.getAll("images").map(String))];
  const fields = { title, price: priceRaw, description, status: statusRaw };

  if (title.length < 2 || title.length > 40) {
    return { error: "제목은 2~40자로 입력해 주세요.", fields };
  }
  if (!/^\d+$/.test(priceRaw) || Number(priceRaw) > 100_000_000) {
    return { error: "가격은 0 ~ 1억 원 사이의 숫자로 입력해 주세요. (0원은 나눔)", fields };
  }
  if (description.length > 2000) {
    return { error: "설명은 2000자 이내로 입력해 주세요.", fields };
  }
  if (imagePaths.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`, fields };
  }
  // 내 폴더의 사진만 허용 — 남의 사진 경로를 끼워 넣으면, 내 글을 지울 때 남의 사진까지 지우려 하게 됩니다.
  if (!imagePaths.every((p) => isOwnImagePath(p, userId))) {
    return { error: "사진 정보가 올바르지 않습니다. 다시 올려 주세요.", fields };
  }
  const status = (POST_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as PostStatus)
    : "selling";

  return {
    input: { title, price: Number(priceRaw), description, status, image_paths: imagePaths },
    fields,
  };
}

/**
 * 로그인한 사용자 id. 서버 액션은 화면 밖에서도(직접 POST) 호출될 수 있으므로
 * 액션마다 로그인 여부를 다시 확인합니다.
 */
async function requireUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  return { supabase, userId };
}

/** C — 판매글 쓰기 */
export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const { supabase, userId } = await requireUserId();
  const parsed = readPostForm(formData, userId);
  if ("error" in parsed) return parsed;

  const { data, error } = await supabase
    .from("market_posts")
    .insert({ ...parsed.input, status: "selling", seller_id: userId })
    .select("id")
    .single();

  if (error) {
    return { error: `등록에 실패했습니다: ${error.message}`, fields: parsed.fields };
  }

  revalidatePath("/");
  redirect(`/posts/${data.id}`);
}

/** U — 판매글 수정 */
export async function updatePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const { supabase, userId } = await requireUserId();
  const id = Number(formData.get("id"));
  const parsed = readPostForm(formData, userId);
  if ("error" in parsed) return parsed;

  // 수정 전 사진 목록 — 빠진 사진을 Storage 에서 지우려고 먼저 읽어 둡니다.
  const { data: before } = await supabase
    .from("market_posts")
    .select("image_paths")
    .eq("id", id)
    .eq("seller_id", userId)
    .maybeSingle();
  if (!before) {
    return { error: "수정할 수 없는 글입니다. (본인 글이 아니거나 삭제됨)", fields: parsed.fields };
  }

  const { error } = await supabase
    .from("market_posts")
    .update({ ...parsed.input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", userId);

  if (error) {
    return { error: `수정에 실패했습니다: ${error.message}`, fields: parsed.fields };
  }

  // DB 저장이 끝난 뒤에 지웁니다. (반대 순서면 저장 실패 시 사진만 사라질 수 있음)
  const removed = (before.image_paths as string[]).filter(
    (p) => !parsed.input.image_paths.includes(p),
  );
  if (removed.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(removed);
  }

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}

/**
 * 평가하기 — 얼굴 버튼을 누르면 호출됩니다.
 * - 처음 누르면 평가 저장, 다른 얼굴을 누르면 바꾸기, 같은 얼굴을 다시 누르면 취소.
 * - 내 글 평가 금지는 RLS 정책이 DB에서 막습니다.
 */
export async function ratePost(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const postId = Number(formData.get("postId"));
  const score = Number(formData.get("score"));
  if (!Number.isInteger(postId) || !Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error("평가 값이 올바르지 않습니다.");
  }

  const { data: existing } = await supabase
    .from("market_ratings")
    .select("score")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  const { error } =
    existing?.score === score
      ? // 같은 얼굴을 다시 누름 → 평가 취소
        await supabase
          .from("market_ratings")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId)
      : // upsert = 없으면 insert, (post_id, user_id) 가 이미 있으면 update
        await supabase.from("market_ratings").upsert(
          { post_id: postId, user_id: userId, score, updated_at: new Date().toISOString() },
          { onConflict: "post_id,user_id" },
        );

  if (error) throw new Error(`평가에 실패했습니다: ${error.message}`);

  // 상세 페이지와 목록(평가 요약)을 다시 그려서 바뀐 결과를 보여 줍니다.
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}

/** D — 판매글 삭제 (사진 파일도 함께) */
export async function deletePost(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const id = Number(formData.get("id"));

  // .select() 를 붙이면 지운 행을 돌려받을 수 있어서, 그 글의 사진 경로를 알 수 있습니다.
  const { data, error } = await supabase
    .from("market_posts")
    .delete()
    .eq("id", id)
    .eq("seller_id", userId)
    .select("image_paths");

  if (error) throw new Error(`삭제에 실패했습니다: ${error.message}`);

  const paths = (data ?? []).flatMap((row) => row.image_paths as string[]);
  if (paths.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  }

  revalidatePath("/");
  redirect("/");
}
