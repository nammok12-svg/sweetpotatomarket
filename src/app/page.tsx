import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatPrice, getPosts } from "@/lib/posts";
import StatusBadge from "@/components/StatusBadge";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* 로그인 상태에 따라 달라지는 부분 */}
      <Suspense fallback={<Hero />}>
        <PersonalHero searchParams={searchParams} />
      </Suspense>

      {/* 누구에게나 같은 부분 — 미리 만들어져 즉시 표시됩니다 */}
      <section className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        {[
          ["동네 기반", "가까운 이웃과 직접 만나 거래합니다."],
          ["신뢰하는 거래", "닉네임과 동네로 판매자를 확인하세요."],
          ["간결한 경험", "필요한 기능만, 깔끔하게 담았습니다."],
        ].map(([title, desc]) => (
          <div key={title} className="bg-surface p-6">
            <h2 className="font-serif text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
          </div>
        ))}
      </section>

      {/* 판매글 목록 — DB 조회는 요청 시점에 하므로 Suspense 안에 둡니다 */}
      <section className="py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-2xl font-bold tracking-tight">최근 판매글</h2>
          <Link
            href="/posts/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-strong"
          >
            판매글 쓰기
          </Link>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-line/40" />}>
          <PostList />
        </Suspense>
      </section>
    </div>
  );
}

async function PostList() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line py-16 text-center text-sm text-muted">
        아직 판매글이 없습니다. 첫 번째 물건을 올려 보세요.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/posts/${post.id}`}
            className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-accent-soft/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{post.title}</p>
              <p className="mt-1 text-xs text-muted">
                {post.seller?.region || "동네 미설정"} · {post.seller?.nickname} ·{" "}
                {formatDate(post.created_at)}
              </p>
              <p className="mt-1.5 font-bold">{formatPrice(post.price)}</p>
            </div>
            <StatusBadge status={post.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function PersonalHero({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  return (
    <>
      {params.welcome && (
        <p className="mt-6 rounded-lg bg-success/8 px-4 py-3 text-sm text-success">
          이메일 인증이 완료되었습니다. 환영합니다!
        </p>
      )}
      <Hero nickname={user?.nickname} region={user?.region} loggedIn={!!user} />
    </>
  );
}

function Hero({
  nickname,
  region,
  loggedIn = false,
}: {
  nickname?: string;
  region?: string;
  loggedIn?: boolean;
}) {
  return (
    <section className="py-20 sm:py-28">
      <p className="text-sm font-medium tracking-widest text-accent">
        SWEET POTATO MARKET
      </p>
      <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
        {loggedIn ? (
          <>
            {nickname}님,
            <br />
            오늘은 어떤 물건을 만나볼까요?
          </>
        ) : (
          <>
            믿을 수 있는 이웃과
            <br />
            정직하게 나누는 중고거래
          </>
        )}
      </h1>
      <p className="mt-6 max-w-xl leading-relaxed text-muted">
        {region
          ? `${region} 이웃들의 물건이 곧 이곳에 모입니다.`
          : "가까운 동네에서, 필요한 사람에게. 고구마마켓은 쓰던 물건에 다음 주인을 찾아 드립니다."}
      </p>

      {!loggedIn && (
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-strong"
          >
            시작하기
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-line bg-surface px-6 py-3 font-medium transition hover:border-foreground/30"
          >
            로그인
          </Link>
        </div>
      )}
    </section>
  );
}
