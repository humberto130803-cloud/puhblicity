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

    const COLORS = [
      "rgba(255,197,61,.5)",
      "rgba(255,59,46,.42)",
      "rgba(255,255,255,.16)",
      "rgba(143,178,218,.3)",
    ];
    type Bit = { x: number; y: number; w: number; h: number; vy: number; vx: number; a: number; va: number; c: string };
    let bits: Bit[] = [];
    let raf = 0;

    function size() {
      if (!tape || !tape.parentElement || !ctx) return;
      const r = tape.parentElement.getBoundingClientRect();
      tape.width = r.width * devicePixelRatio;
      tape.height = r.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      bits = Array.from({ length: 54 }, () => ({
        x: Math.random() * r.width,
        y: Math.random() * r.height,
        w: 2 + Math.random() * 4,
        h: 6 + Math.random() * 13,
        vy: 0.12 + Math.random() * 0.42,
        vx: -0.12 + Math.random() * 0.24,
        a: Math.random() * Math.PI,
        va: (-0.5 + Math.random()) * 0.016,
        c: COLORS[(Math.random() * COLORS.length) | 0],
      }));
    }
    function loop() {
      if (!tape || !tape.parentElement || !ctx) return;
      const r = tape.parentElement.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      for (const b of bits) {
        b.y += b.vy; b.x += b.vx; b.a += b.va;
        if (b.y > r.height + 20) { b.y = -20; b.x = Math.random() * r.width; }
        if (b.x < -20) b.x = r.width + 20;
        if (b.x > r.width + 20) b.x = -20;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.a);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    }
    size();
    loop();
    addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
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
