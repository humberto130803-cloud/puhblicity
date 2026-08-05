"use client";

import { useEffect, useRef } from "react";

/**
 * Celebration confetti, ported from the reference. Mount <ConfettiCanvas/>
 * once (site layout); call burst(x, y, n) from anywhere client-side.
 * No-ops under prefers-reduced-motion.
 */

type Piece = {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; a: number; va: number;
  c: string; life: number;
};

let ctx: CanvasRenderingContext2D | null = null;
let pieces: Piece[] = [];
let running = false;

const COLS = ["#FFC53D", "#FF3B2E", "#0E8A6A", "#FFFFFF", "#143A6B"];

export function burst(x: number, y: number, n: number): void {
  if (!ctx) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < n; i++) {
    pieces.push({
      x, y,
      vx: (-0.5 + Math.random()) * 11,
      vy: -Math.random() * 13 - 3,
      w: 4 + Math.random() * 7,
      h: 7 + Math.random() * 10,
      a: Math.random() * 6,
      va: (-0.5 + Math.random()) * 0.35,
      c: COLS[(Math.random() * COLS.length) | 0],
      life: 0,
    });
  }
  if (!running) run();
}

function run(): void {
  running = true;
  (function frame() {
    if (!ctx) { running = false; return; }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces = pieces.filter((p) => p.life < 170);
    for (const p of pieces) {
      p.life++; p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.a += p.va; p.vx *= 0.995;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.globalAlpha = Math.max(0, 1 - p.life / 170);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (pieces.length) requestAnimationFrame(frame);
    else {
      running = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  })();
}

export function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cc = ref.current;
    if (!cc) return;
    const c2 = cc.getContext("2d");
    const fit = () => {
      cc.width = window.innerWidth * devicePixelRatio;
      cc.height = window.innerHeight * devicePixelRatio;
      c2?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    fit();
    ctx = c2;
    addEventListener("resize", fit);
    return () => {
      removeEventListener("resize", fit);
      if (ctx === c2) ctx = null;
    };
  }, []);
  return <canvas ref={ref} className="confetti-canvas" aria-hidden="true" />;
}
