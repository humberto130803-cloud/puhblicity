/**
 * Defences for the two free-text fields on the site: the dare `detail`
 * (140 chars) and the backer note (80 chars). Ported from SOLMATE's
 * text-safety (invisible chars, bidi overrides, link detection), plus the
 * banned-terms gate the spec requires.
 *
 * The filter is a coarse first line. The real safety net is that dares from
 * unproven wallets are flagged and held for admin clearance before they
 * appear on the board.
 */

const INVISIBLE_RE = new RegExp("[" + "\\u200B-\\u200F\\u00A0\\u2028-\\u202E\\u2060-\\u206F\\uFEFF" + "]", "g");
const CONTROL_RE = new RegExp("[" + "\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F" + "]", "g");

/** Strip invisibles/controls, normalise, collapse whitespace runs. */
export function cleanText(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(INVISIBLE_RE, "")
    .replace(CONTROL_RE, "")
    .replace(/\n+/g, " ")
    .replace(/[ \t]{4,}/g, "   ")
    .trim();
}

/** Broad link detection, including "example dot com" obfuscations. */
export function containsLink(text: string): boolean {
  const t = text.toLowerCase();
  if (/\b(?:https?|ftp|ipfs|ar|magnet|data|javascript):/i.test(t)) return true;
  if (/\bwww\.\w/i.test(t)) return true;
  const deobfuscated = t
    .replace(/\s*[\[({<]\s*(?:dot|\.)\s*[\])}>]\s*/g, ".")
    .replace(/\s+dot\s+/g, ".")
    .replace(/\s*\(\s*\.\s*\)\s*/g, ".");
  if (/\b[a-z0-9][a-z0-9-]{0,62}\.[a-z]{2,24}\b/i.test(deobfuscated)) return true;
  return false;
}

/**
 * Terms that end the conversation for a 140-char public dare detail.
 * Matched on word boundaries, case-insensitive, English + Spanish.
 * Coarse by design — a false positive costs a reworded sentence; a false
 * negative costs a screenshot of the front page.
 */
const BANNED_TERMS = [
  // sexual
  "sex", "sexual", "nude", "naked", "nudes", "porn", "onlyfans", "nsfw",
  "desnud", "sexo",
  // self-harm / harm
  "suicide", "kill myself", "self harm", "self-harm", "cut myself", "die",
  "suicidio", "matarme", "morir",
  // alcohol / drugs (the category list already excludes these acts)
  "beer", "vodka", "tequila", "whiskey", "shots", "drunk", "alcohol", "weed",
  "cocaine", "pills", "drugs", "borracho", "cerveza", "droga",
  // danger escalators the allowlist forbids
  "roof", "bridge", "highway", "traffic", "gun", "knife", "fire", "burn",
  "choke", "fight", "punch", "techo", "puente", "pistola", "cuchillo", "fuego",
  // slurs (compact list; the admin clearance queue is the real gate)
  "nigger", "nigga", "faggot", "fag", "tranny", "retard", "spic", "kike",
  "chink", "maricon", "maricón",
] as const;

const BANNED_RE = new RegExp(
  "(?:^|[^a-záéíóúñ])(" +
    BANNED_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
    ")(?:[^a-záéíóúñ]|$)",
  "i"
);

/** Phone-number-ish digit runs. 7+ digits with optional separators. */
const PHONE_RE = /(?:\d[\s\-.()]?){7,}/;

export type TextVerdict =
  | { ok: true; value: string }
  | { ok: false; reason: string };

/**
 * Validate the dare detail or a backer note.
 * `ownInstagram` — the doer's own handle, the one @ allowed to appear.
 */
export function checkPublicText(
  raw: string,
  maxLen: number,
  ownInstagram?: string | null
): TextVerdict {
  const value = cleanText(raw);
  if (value.length > maxLen) {
    return { ok: false, reason: `Keep it under ${maxLen} characters.` };
  }
  if (BANNED_RE.test(value)) {
    return {
      ok: false,
      reason:
        "That wording isn't allowed here. Dares stay legal, safe, and aimed at nobody but you — reword it.",
    };
  }
  if (containsLink(value)) {
    return { ok: false, reason: "No links in a dare. The dare speaks for itself." };
  }
  if (PHONE_RE.test(value)) {
    return { ok: false, reason: "No phone numbers." };
  }
  // Only the doer's own handle may be mentioned.
  const mentions = value.match(/@[a-z0-9_.]+/gi) ?? [];
  const own = (ownInstagram ?? "").toLowerCase().replace(/^@/, "");
  for (const m of mentions) {
    if (m.slice(1).toLowerCase() !== own || !own) {
      return {
        ok: false,
        reason: "You can mention your own handle, nobody else's. No dare aims at another person.",
      };
    }
  }
  return { ok: true, value };
}
