"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { POST_STATUSES, type PostStatus } from "@/lib/posts";

export type PostFormState = {
  error?: string;
  fields?: Record<string, string>;
};

type PostInput = {
  title: string;
  price: number;
  description: string;
  status: PostStatus;
};

/**
 * 폼 입력값 검사. 통과하면 { input }, 아니면 { error } 를 돌려줍니다.
 * DB에도 같은 check 제약이 있지만, 사용자에게 친절한 메시지를 주려고 여기서 먼저 검사합니다.
 */
function readPostForm(formData: FormData):
  | { input: PostInput; fields: Record<string, string> }
  | { error: string; fields: Record<string, string> } {
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").replaceAll(",", "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "selling");
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
  const status = (POST_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as PostStatus)
    : "selling";

  return { input: { title, price: Number(priceRaw), description, status }, fields };
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
  const parsed = readPostForm(formData);
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
  const parsed = readPostForm(formData);
  if ("error" in parsed) return parsed;

  // RLS 가 "본인 글만 수정"을 막아 주지만, 남의 글이면 에러 대신 0행이 바뀝니다.
  // 그래서 .select() 로 실제로 바뀐 행이 있는지 확인합니다.
  const { data, error } = await supabase
    .from("market_posts")
    .update({ ...parsed.input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", userId)
    .select("id");

  if (error) {
    return { error: `수정에 실패했습니다: ${error.message}`, fields: parsed.fields };
  }
  if (!data || data.length === 0) {
    return { error: "수정할 수 없는 글입니다. (본인 글이 아니거나 삭제됨)", fields: parsed.fields };
  }

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}

/** D — 판매글 삭제 */
export async function deletePost(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const id = Number(formData.get("id"));

  const { error } = await supabase
    .from("market_posts")
    .delete()
    .eq("id", id)
    .eq("seller_id", userId);

  if (error) throw new Error(`삭제에 실패했습니다: ${error.message}`);

  revalidatePath("/");
  redirect("/");
}
