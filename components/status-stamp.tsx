"use client";

import { useT } from "@/components/locale-provider";

/** Rubber-stamped state. One per dare, top of the header. */
const CLS: Record<string, string> = {
  OPEN: "stamp-open",
  CLOSED: "stamp-closed",
  IN_REVIEW: "stamp-review",
  PAID: "stamp-paid",
  REFUNDING: "stamp-refunded",
  REFUNDED: "stamp-refunded",
  KILLED: "stamp-killed",
};

export function StatusStamp({ status, big = false }: { status: string; big?: boolean }) {
  const t = useT();
  const cls = CLS[status];
  const text = t.status[status];
  if (!cls || !text) return null;
  return <span className={`stamp ${cls}${big ? " stamp-big" : ""}`}>{text}</span>;
}
