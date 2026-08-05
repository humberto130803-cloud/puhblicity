/**
 * Generates the PWA / home-screen icon set into public/.
 *
 *   node scripts/gen-icons.mjs
 *
 * The mark is the official logo: a gold "P" on the deep navy tote plate,
 * with the hairline split running across the middle. At 48px on a home
 * screen a wordmark is unreadable, so the plate itself is the logo.
 *
 * Two shapes are produced:
 *   · normal   — plate with rounded corners, transparent margin
 *   · maskable — full-bleed navy so Android can crop it to any silhouette
 *                without eating the digit (safe zone is the middle 80%)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public");
fs.mkdirSync(OUT, { recursive: true });

const INK = "#14202E";
const GOLD = "#FFC53D";
const FLARE = "#FF3B2E";

/** The plate, drawn at an arbitrary size. `bleed` fills the whole canvas. */
function plateSvg(size, { bleed = false } = {}) {
  const pad = bleed ? 0 : size * 0.06;
  const box = size - pad * 2;
  const radius = bleed ? 0 : size * 0.16;
  // Font-size is ~1.35x the cap height in a condensed face, so these look
  // oversized as numbers but render as a P filling most of the plate — which
  // is what the logo does. Maskable stays a touch smaller: some launchers
  // crop to a circle and only the middle 80% is guaranteed to survive.
  const glyph = bleed ? size * 1.12 : box * 1.25;
  const cy = size / 2;
  const rule = Math.max(1, size * 0.011);
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${pad}" y="${pad}" width="${box}" height="${box}" rx="${radius}" fill="${INK}"/>
  <text x="50%" y="${cy}" fill="${GOLD}"
        font-family="Anton, Haettenschweiler, 'Arial Narrow', Impact, sans-serif"
        font-size="${glyph}" text-anchor="middle" dominant-baseline="central">P</text>
  <rect x="${pad}" y="${cy - rule / 2}" width="${box}" height="${rule}" fill="${INK}"/>
  <rect x="${pad}" y="${cy - rule / 2}" width="${box}" height="${rule}" fill="#000" opacity="0.35"/>
</svg>`);
}

/** Marketing/splash background: the plate centred on the field. */
function splashSvg(w, h) {
  const s = Math.min(w, h) * 0.34;
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${INK}"/>
  <circle cx="${w * 0.68}" cy="${h * 0.44}" r="${Math.max(w, h) * 0.55}" fill="#143A6B" opacity="0.55"/>
  <rect x="${(w - s) / 2}" y="${(h - s * 1.42) / 2}" width="${s}" height="${s * 1.42}" rx="${s * 0.05}" fill="#071726"/>
  <text x="50%" y="${h / 2}" fill="${GOLD}"
        font-family="Anton, Haettenschweiler, 'Arial Narrow', Impact, sans-serif"
        font-size="${s * 1.15}" text-anchor="middle" dominant-baseline="central">P</text>
  <rect x="${(w - s) / 2}" y="${h / 2 - 1.5}" width="${s}" height="3" fill="#071726"/>
  <rect x="${(w - s) / 2}" y="${h / 2 - 1.5}" width="${s}" height="3" fill="#000" opacity="0.4"/>
  <text x="50%" y="${h / 2 + s * 1.15}" fill="#FFFFFF"
        font-family="Anton, Haettenschweiler, 'Arial Narrow', Impact, sans-serif"
        font-size="${Math.min(w, h) * 0.075}" text-anchor="middle">PUHBLICITY</text>
  <rect x="${w / 2 - Math.min(w, h) * 0.03}" y="${h / 2 + s * 1.3}"
        width="${Math.min(w, h) * 0.06}" height="${Math.min(w, h) * 0.012}" fill="${FLARE}"/>
</svg>`);
}

const jobs = [
  ["icon-192.png", plateSvg(192), 192],
  ["icon-512.png", plateSvg(512), 512],
  ["icon-maskable-192.png", plateSvg(192, { bleed: true }), 192],
  ["icon-maskable-512.png", plateSvg(512, { bleed: true }), 512],
  // iOS home screen. Apple ignores transparency and squares the corners
  // itself, so this one is full-bleed too.
  ["apple-touch-icon.png", plateSvg(180, { bleed: true }), 180],
];

for (const [name, svg, size] of jobs) {
  await sharp(svg).resize(size, size).png().toFile(path.join(OUT, name));
  console.log("  wrote", name);
}

await sharp(splashSvg(1170, 2532)).png().toFile(path.join(OUT, "splash.png"));
console.log("  wrote splash.png");

// Favicon: the small plate, 32px, as PNG (browsers accept PNG favicons).
await sharp(plateSvg(64, { bleed: true })).resize(64, 64).png()
  .toFile(path.join(OUT, "favicon.png"));
console.log("  wrote favicon.png");

console.log("icons generated into public/");
