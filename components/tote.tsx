"use client";

import { useEffect, useRef, useState } from "react";
import { formatSol } from "@/lib/format";

/**
 * THE TOTE — gold Anton digits on navy plates that flip like a split-flap
 * board when the value changes. The one place motion is allowed to be loud.
 * Under prefers-reduced-motion digits swap without moving (CSS kills the
 * animation; the swap logic below still runs).
 */

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function Tote({
  value,
  size = "md",
  onField = false,
  countUp = false,
  className = "",
  style,
}: {
  /** Display string, e.g. "1.35" — already formatted. */
  value: string;
  size?: "sm" | "md" | "lg" | "xl";
  onField?: boolean;
  /** Roll from 0 to the value on mount (hero moment). */
  countUp?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [chars, setChars] = useState<string[]>(() =>
    countUp ? [...value].map((c) => (/\d/.test(c) ? "0" : c)) : [...value]
  );
  const [flipping, setFlipping] = useState<Set<number>>(new Set());
  const target = useRef(value);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Count-up on mount.
  useEffect(() => {
    if (!countUp) return;
    if (reducedMotion()) {
      setChars([...value]);
      return;
    }
    const dp = (value.split(".")[1] ?? "").length;
    const end = parseFloat(value);
    if (!isFinite(end)) return;
    const dur = 1500;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setChars([...(end * eased).toFixed(dp)]);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flip changed plates when value updates.
  useEffect(() => {
    if (value === target.current) return;
    target.current = value;
    const next = [...value];
    if (reducedMotion()) {
      setChars(next);
      return;
    }
    setChars((prev) => {
      if (prev.length !== next.length) return next;
      const changed = new Set<number>();
      next.forEach((ch, i) => {
        if (prev[i] !== ch) changed.add(i);
      });
      if (changed.size) {
        setFlipping(changed);
        // Swap the glyph mid-flip, like the reference's setTote().
        timeouts.current.push(
          setTimeout(() => setChars(next), 200),
          setTimeout(() => setFlipping(new Set()), 440)
        );
        return prev;
      }
      return next;
    });
  }, [value]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  return (
    <div
      className={`tote tote-${size} ${onField ? "on-field" : ""} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${value} SOL`}
      style={style}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          className={`plate${ch === "." ? " dot" : ""}${flipping.has(i) ? " flip" : ""}`}
          aria-hidden="true"
        >
          {ch}
        </span>
      ))}
      <span className="plate unit" aria-hidden="true">
        SOL
      </span>
    </div>
  );
}

/**
 * The thermometer. Fill animates on mount (width transition in CSS),
 * stripes run while live, jade when done, slate when dead.
 */
export function Therm({
  pct,
  state = "live",
  onField = false,
  notch = true,
  targetLabel,
  ticks = 0,
}: {
  pct: number; // 0..100
  state?: "live" | "done" | "dead";
  onField?: boolean;
  notch?: boolean;
  targetLabel?: string;
  ticks?: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.max(0, Math.min(100, pct))), 60);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{ position: "relative" }} className={onField ? "on-field" : ""}>
      <div className="therm">
        <div
          className={`therm-fill${state === "done" ? " is-done" : state === "dead" ? " is-dead" : ""}`}
          style={{ width: `${width}%` }}
        />
        {ticks > 0 && (
          <div className="therm-ticks">
            {Array.from({ length: ticks }, (_, i) => (
              <i key={i} />
            ))}
          </div>
        )}
        {notch && <div className="therm-notch" style={{ left: "100%" }} />}
      </div>
      {targetLabel && (
        // Right-aligned rather than centred on the notch: the notch sits at
        // 100%, so a centred label hangs half its width past the panel edge
        // and gets sheared off.
        <span
          className="therm-target-label"
          style={{ right: 0, top: 25, color: onField ? "#CFE0F3" : undefined }}
        >
          {targetLabel}
        </span>
      )}
    </div>
  );
}

export { fillPct, toteValue } from "@/lib/format";
