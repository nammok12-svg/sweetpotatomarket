"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/** 회원가입 */
export async function signup(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const nickname = str(formData, "nickname");
  const region = str(formData, "region");
  const fields = { email, nickname, region };

  // 1) 입력값 검사
  if (!EMAIL_RE.test(email)) {
    return { error: "올바른 이메일 주소를 입력해 주세요.", fields };
  }
  if (nickname.length < 2 || nickname.length > 12) {
    return { error: "닉네임은 2~12자로 입력해 주세요.", fields };
  }
  if (region.length > 30) {
    return { error: "동네 이름은 30자 이내로 입력해 주세요.", fields };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다.", fields };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 서로 일치하지 않습니다.", fields };
  }

  const supabase = await createClient();

  // 2) 닉네임 중복 확인
  const { data: taken } = await supabase
    .from("market_profiles")
    .select("id")
    .eq("nickname", nickname)
    .maybeSingle();
  if (taken) {
    return { error: "이미 사용 중인 닉네임입니다.", fields };
  }

  // 3) 가입 요청 — nickname/region 은 메타데이터로 넘기면
  //    DB 트리거가 market_profiles 행을 자동으로 만듭니다.
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, region },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "이미 가입된 이메일입니다.", fields };
    }
    return { error: `가입에 실패했습니다: ${error.message}`, fields };
  }

  // 이메일 인증이 꺼져 있으면 바로 세션이 생깁니다.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  // 이메일 인증이 켜져 있으면 메일함 확인 안내
  // (이미 가입된 이메일이면 Supabase가 identities 를 빈 배열로 돌려줍니다)
  if (data.user && data.user.identities?.length === 0) {
    return { error: "이미 가입된 이메일입니다.", fields };
  }
  return {
    message: `${email} 으로 인증 메일을 보냈습니다. 메일의 링크를 누르면 가입이 완료됩니다.`,
  };
}

/** 로그인 */
export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  const next = str(formData, "next");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요.", fields: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.code === "email_not_confirmed"
        ? "이메일 인증이 아직 완료되지 않았습니다. 메일함을 확인해 주세요."
        : "이메일 또는 비밀번호가 올바르지 않습니다.";
    return { error: msg, fields: { email } };
  }

  revalidatePath("/", "layout");
  // 외부 주소로 튕기지 않도록 "/" 로 시작하는 경로만 허용
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

/** 로그아웃 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
