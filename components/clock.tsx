"use client";

import { useEffect, useState } from "react";

function fmt(s: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/**
 * Live countdown to an ISO timestamp: "2d 03:12:44" / "03:12:44".
 * Turns urgent (red) under six hours. Ticks every second.
 */
export function Clock({
  until,
  urgentUnderHours = 6,
  className = "",
  endedText = "00:00:00",
}: {
  until: string;
  urgentUnderHours?: number;
  className?: string;
  endedText?: string;
}) {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    const compute = () =>
      Math.max(0, Math.floor((new Date(until).getTime() - Date.now()) / 1000));
    setSecs(compute());
    const iv = setInterval(() => setSecs(compute()), 1000);
    return () => clearInterval(iv);
  }, [until]);

  const urgent = secs !== null && secs < urgentUnderHours * 3600;
  return (
    <span className={`clock${urgent ? " urgent" : ""} ${className}`} suppressHydrationWarning>
      {secs === null ? "—" : secs <= 0 ? endedText : fmt(secs)}
    </span>
  );
}
