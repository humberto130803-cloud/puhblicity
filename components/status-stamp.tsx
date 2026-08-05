/** Rubber-stamped state. One per dare, top of the header. */
const MAP: Record<string, { cls: string; text: string }> = {
  OPEN: { cls: "stamp-open", text: "Open" },
  CLOSED: { cls: "stamp-closed", text: "Funded — proof due" },
  IN_REVIEW: { cls: "stamp-review", text: "In review" },
  PAID: { cls: "stamp-paid", text: "Paid out" },
  REFUNDING: { cls: "stamp-refunded", text: "Refunding" },
  REFUNDED: { cls: "stamp-refunded", text: "Refunded in full" },
  KILLED: { cls: "stamp-killed", text: "Removed" },
};

export function StatusStamp({ status, big = false }: { status: string; big?: boolean }) {
  const s = MAP[status];
  if (!s) return null;
  return <span className={`stamp ${s.cls}${big ? " stamp-big" : ""}`}>{s.text}</span>;
}
