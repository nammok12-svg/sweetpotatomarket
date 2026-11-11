import { STATUS_LABEL, type PostStatus } from "@/lib/posts";

/** 판매중이면 배지를 숨기고, 예약중·거래완료일 때만 표시합니다. */
export default function StatusBadge({ status }: { status: PostStatus }) {
  if (status === "selling") return null;
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
        status === "reserved" ? "bg-success/10 text-success" : "bg-line text-muted"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
