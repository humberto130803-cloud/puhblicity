"use client";

import { useEffect, useRef } from "react";
import { formatSol } from "@/lib/format";

/**
 * The signature element (§13): every SOL amount of consequence as gold
 * digits on navy plates, over a red thermometer with a notch at the target.
 * One orchestrated moment: plates flip and the bar animates when the pot
 * climbs. prefers-reduced-motion swaps digits without animating (CSS).
 */
export function Tote({
  pot,
  target,
  size = "md",
  onField = false,
  showThermo = true,
}: {
  pot: bigint;
  target: bigint;
  size?: "sm" | "md" | "lg";
  onField?: boolean;
  showThermo?: boolean;
}) {
  const text = formatSol(pot);
  const prev = useRef(text);
  const fresh = prev.current !== text;
  useEffect(() => {
    prev.current = text;
  });

  // Display-only ratio — safe to leave bigint land here.
  const pct =
    target > 0n ? Math.min(100, (Number(pot) / Number(target)) * 100) : 0;

  return (
    <div>
      <div
        className={`tote tote--${size}`}
        role="status"
        aria-live="polite"
        aria-label={`Pot: ${text} of ${formatSol(target)} SOL`}
      >
        {text.split("").map((ch, i) => (
          <div
            key={`${i}-${ch}`}
            className={`tote__plate${ch === "." ? " tote__plate--dot" : ""}${
              fresh ? " tote__plate--fresh" : ""
            }`}
          >
            <span>{ch}</span>
          </div>
        ))}
        <div className="tote__unit">SOL</div>
      </div>
      {showThermo && (
        <div
          className={`thermo${onField ? " thermo--onfield" : ""}`}
          style={{ marginTop: 26 }}
          aria-hidden="true"
        >
          <div className="thermo__fill" style={{ width: `${pct}%` }} />
          <div className="thermo__notch" style={{ left: "100%" }}>
            <div className="thermo__notch-label">
              target {formatSol(target)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
