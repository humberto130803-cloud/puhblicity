"use client";

import { useEffect, useRef } from "react";

/** Ambient ticker tape drifting through the hero. Skipped under reduced motion. */
export function Tape() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const tape = ref.current;
    if (!tape) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = tape.getContext("2d");
    if (!ctx) return;

    // Gold, flare, white, field-blue — the tote palette, thrown in the air.
    const COLORS = ["255,197,61", "255,59,46", "255,255,255", "143,178,218"];
    type Bit = {
      x: number; y: number; w: number; h: number;
      vy: number; vx: number; a: number; va: number;
      c: string; depth: number;
    };
    let bits: Bit[] = [];
    let raf = 0;
    // Mouse parallax, eased — the near layer swings, the far layer barely moves.
    let mx = 0, my = 0, px = 0, py = 0;

    function size() {
      if (!tape || !tape.parentElement || !ctx) return;
      const r = tape.parentElement.getBoundingClientRect();
      tape.width = r.width * devicePixelRatio;
      tape.height = r.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      // Denser than the reference, and layered: depth drives size, speed,
      // spin and opacity together so the field reads as air with volume
      // rather than one flat sheet of specks.
      bits = Array.from({ length: 96 }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * r.width,
          y: Math.random() * r.height,
          w: 1.6 + depth * 5,
          h: 5 + depth * 16,
          vy: 0.06 + depth * 0.62,
          vx: -0.1 + Math.random() * 0.2,
          a: Math.random() * Math.PI,
          va: (-0.5 + Math.random()) * (0.006 + depth * 0.03),
          c: COLORS[(Math.random() * COLORS.length) | 0],
          depth,
        };
      });
    }
    function loop() {
      if (!tape || !tape.parentElement || !ctx) return;
      const r = tape.parentElement.getBoundingClientRect();
      px += (mx - px) * 0.05;
      py += (my - py) * 0.05;
      ctx.clearRect(0, 0, r.width, r.height);
      for (const b of bits) {
        b.y += b.vy; b.x += b.vx; b.a += b.va;
        if (b.y > r.height + 24) { b.y = -24; b.x = Math.random() * r.width; }
        if (b.x < -24) b.x = r.width + 24;
        if (b.x > r.width + 24) b.x = -24;
        const ox = px * (6 + b.depth * 34);
        const oy = py * (4 + b.depth * 22);
        ctx.save();
        ctx.translate(b.x + ox, b.y + oy);
        ctx.rotate(b.a);
        ctx.fillStyle = `rgba(${b.c},${0.1 + b.depth * 0.45})`;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    }
    function onMove(e: MouseEvent) {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    }
    size();
    loop();
    addEventListener("resize", size);
    addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      removeEventListener("mousemove", onMove);
    };
  }, []);
  return <canvas ref={ref} className="tape-canvas" aria-hidden="true" />;
}

/** Floating parallax tote plates in the hero. */
export function Floaters() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = ref.current;
    if (!root) return;
    const floaters = [...root.querySelectorAll<HTMLElement>(".floater")];
    const onMove = (e: MouseEvent) => {
      const cx = e.clientX / innerWidth - 0.5;
      const cy = e.clientY / innerHeight - 0.5;
      for (const f of floaters) {
        const d = parseFloat(f.dataset.depth ?? "20");
        f.style.marginLeft = `${-cx * d}px`;
        f.style.marginTop = `${-cy * d}px`;
      }
    };
    addEventListener("mousemove", onMove);
    return () => removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div ref={ref} className="floaters" aria-hidden="true">
      <div className="floater f1" data-depth="26">5</div>
      <div className="floater f2" data-depth="42">·</div>
      <div className="floater f3" data-depth="16">0</div>
    </div>
  );
}

/** The gold ticker under the hero. Items double up for a seamless loop. */
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
