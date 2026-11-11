import { Suspense } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {/* 로그인 상태는 요청마다 달라서 Suspense 안에서 따로 불러옵니다 */}
        <Suspense fallback={<div className="h-9 w-36" />}>
          <UserNav />
        </Suspense>
      </div>
    </header>
  );
}

async function UserNav() {
  const user = await getCurrentUser();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {user ? (
        <>
          <span className="mr-2 hidden text-muted sm:inline">
            <strong className="font-medium text-foreground">{user.nickname}</strong>님
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md px-3 py-2 text-muted transition hover:bg-accent-soft hover:text-accent-strong"
            >
              로그아웃
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-muted transition hover:text-foreground"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-accent px-3.5 py-2 font-medium text-white transition hover:bg-accent-strong"
          >
            회원가입
          </Link>
        </>
      )}
    </nav>
  );
}
