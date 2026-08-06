/**
 * The vocabulary is load-bearing (spec §12), so the Spanish keeps its own
 * fixed set rather than translating word by word:
 *
 *   dare      → reto
 *   the doer  → quien lo hace   (never "el retado" — that would imply
 *                                somebody dared them, which is the exact
 *                                thing this product refuses to allow)
 *   to back   → apoyar
 *   backers   → apoyos
 *   the pot   → el bote
 *   target    → la meta
 *   ceiling   → el tope
 *   paid out  → pagado
 *   refunded  → reembolsado
 *
 * Latin American Spanish, "tú" throughout, no "vosotros".
 */
export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "puhb_lang";

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "es";
}
