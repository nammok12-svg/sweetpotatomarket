import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      {/* 고구마를 단순화한 마크 */}
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <ellipse
          cx="16"
          cy="17"
          rx="9"
          ry="12"
          transform="rotate(-35 16 17)"
          fill="var(--accent)"
        />
        <path
          d="M22 6c1.5-2 3.5-2.5 5-2"
          stroke="var(--success)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="font-serif text-xl font-bold tracking-tight text-foreground">
        고구마마켓
      </span>
    </Link>
  );
}
