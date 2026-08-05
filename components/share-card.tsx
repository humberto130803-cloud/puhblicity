"use client";

import { useState } from "react";
import { formatSol } from "@/lib/format";
import type { PublicDare } from "@/lib/dares";

/**
 * Ready-made share images drawn on a canvas — the tote, the pot, the line.
 * Story 9:16 and Post 4:5, downloaded as PNG. Plus copy-link.
 */

function drawCard(
  dare: PublicDare,
  w: number,
  h: number,
  paidOut: string
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  const anton = `'Anton', sans-serif`;
  const mono = `'DM Mono', monospace`;
  const cx = w / 2;

  // field
  x.fillStyle = "#14202E";
  x.fillRect(0, 0, w, h);
  const rg = x.createRadialGradient(w * 0.68, h * 0.42, 0, w * 0.68, h * 0.42, w * 0.9);
  rg.addColorStop(0, "rgba(20,58,107,.85)");
  rg.addColorStop(1, "rgba(20,32,46,0)");
  x.fillStyle = rg;
  x.fillRect(0, 0, w, h);

  // ticker bits
  const cols = ["rgba(255,197,61,.5)", "rgba(255,59,46,.42)", "rgba(255,255,255,.16)"];
  for (let i = 0; i < 60; i++) {
    x.save();
    x.translate(Math.random() * w, Math.random() * h);
    x.rotate(Math.random() * Math.PI);
    x.fillStyle = cols[i % 3];
    x.fillRect(0, 0, 4 + Math.random() * 5, 9 + Math.random() * 16);
    x.restore();
  }

  // brand
  x.fillStyle = "#FF3B2E";
  x.fillRect(cx - w * 0.31, h * 0.09, 26, 26);
  x.fillStyle = "#fff";
  x.font = `36px ${anton}`;
  x.textAlign = "left";
  x.fillText("PUHBLICITY", cx - w * 0.31 + 40, h * 0.09 + 24);

  // the line
  x.textAlign = "center";
  x.fillStyle = "#fff";
  x.font = `${Math.round(w * 0.085)}px ${anton}`;
  const line = dare.status === "PAID" ? "DID THE THING." : "WILL DO THE THING.";
  x.fillText(dare.doer_name.toUpperCase(), cx, h * 0.3);
  x.fillText(line, cx, h * 0.3 + w * 0.1);

  // category
  x.font = `26px ${mono}`;
  x.fillStyle = "#8FB2DA";
  x.fillText(`${dare.category_emoji}  ${dare.category_label.toUpperCase()}`, cx, h * 0.3 + w * 0.19);

  // tote plates
  const value = formatSol(BigInt(dare.pot));
  const chars = [...value];
  const pw = Math.min(110, (w * 0.8) / (chars.length + 1));
  const ph = pw * 1.42;
  const gap = 4;
  const total = chars.length * (pw + gap);
  let px = cx - total / 2;
  const py = h * 0.52;
  for (const ch of chars) {
    if (ch === ".") {
      x.fillStyle = "#fff";
      x.font = `${pw}px ${anton}`;
      x.fillText(".", px + pw * 0.18, py + ph * 0.82);
      px += pw * 0.36 + gap;
      continue;
    }
    x.fillStyle = "#071726";
    x.fillRect(px, py, pw, ph);
    x.strokeStyle = "rgba(255,255,255,.09)";
    x.strokeRect(px, py, pw, ph);
    x.fillStyle = "rgba(0,0,0,.55)";
    x.fillRect(px, py + ph / 2, pw, 2);
    x.fillStyle = "#FFC53D";
    x.font = `${pw * 0.92}px ${anton}`;
    x.fillText(ch, px + pw / 2, py + ph * 0.78);
    px += pw + gap;
  }
  x.fillStyle = "#8FB2DA";
  x.font = `28px ${mono}`;
  x.fillText("SOL " + (dare.status === "PAID" ? "· PAID OUT" : "IN THE POT"), cx, py + ph + 52);

  // thermometer
  const tw = w * 0.72;
  const ty = py + ph + 92;
  const pct = Math.min(1, Number(BigInt(dare.pot)) / Number(BigInt(dare.target)));
  x.strokeStyle = "rgba(255,255,255,.3)";
  x.lineWidth = 3;
  x.strokeRect(cx - tw / 2, ty, tw, 26);
  x.fillStyle = dare.status === "PAID" ? "#0E8A6A" : "#FF3B2E";
  x.fillRect(cx - tw / 2 + 3, ty + 3, (tw - 6) * pct, 20);
  x.fillStyle = "#8FB2DA";
  x.font = `22px ${mono}`;
  x.fillText(
    `${Math.round(pct * 100)}% OF ${formatSol(BigInt(dare.target))} TARGET`,
    cx,
    ty + 62
  );

  // footer
  x.fillStyle = "rgba(255,255,255,.55)";
  x.font = `24px ${mono}`;
  x.fillText(`puhblicity.vercel.app/d/${dare.id}`, cx, h * 0.93);
  if (paidOut) {
    x.fillStyle = "#FFC53D";
    x.fillText(paidOut, cx, h * 0.93 - 40);
  }
  return c;
}

export function ShareCard({ dare }: { dare: PublicDare }) {
  const [copied, setCopied] = useState(false);

  async function download(kind: "story" | "post") {
    // Make sure the display faces are loaded before drawing.
    try {
      await Promise.all([
        document.fonts.load("80px 'Anton'"),
        document.fonts.load("28px 'DM Mono'"),
      ]);
    } catch { /* draw with fallbacks */ }
    const [w, h] = kind === "story" ? [1080, 1920] : [1080, 1350];
    const canvas = drawCard(dare, w, h, "");
    const a = document.createElement("a");
    a.download = `puhblicity-${dare.id}-${kind}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/d/${dare.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }

  const payout = formatSol((BigInt(dare.pot) * 9000n) / 10000n);
  const headline =
    dare.status === "PAID"
      ? `${dare.doer_name} did it for ${payout} SOL.`
      : `${dare.doer_name} will do it. Fill the bar.`;

  return (
    <div className="sharecard">
      <p className="eyebrow">Post it</p>
      <h2 className="h2" style={{ margin: "11px 0 15px" }}>{headline}</h2>
      <p className="small" style={{ color: "#CFE0F3" }}>
        A ready-made card with the tote, the pot and the link. Sized for
        Stories and for the grid. Tag @puhblicity and it goes on the wall.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <button className="btn btn-sm on-dark-btn" onClick={() => void download("story")}>
          <span>Story · 9:16</span>
        </button>
        <button className="btn btn-sm on-dark-btn" onClick={() => void download("post")}>
          <span>Post · 4:5</span>
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => void copyLink()}>
          <span>{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>
    </div>
  );
}
