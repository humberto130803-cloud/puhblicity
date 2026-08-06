import { cookies, headers } from "next/headers";
import { en, type Dict } from "./en";
import { es } from "./es";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./types";

export type { Locale, Dict };
export { LOCALE_COOKIE, LOCALES, isLocale } from "./types";

const DICTS: Record<Locale, Dict> = { en, es };

export const dictFor = (locale: Locale): Dict => DICTS[locale] ?? en;

/**
 * The visitor's language, in priority order:
 *   1. the cookie they set with the toggle — an explicit choice always wins
 *   2. their browser's Accept-Language — so the Spanish crypto crowd lands
 *      on Spanish without having to find a switch first
 *   3. English
 *
 * Server components only. Reading cookies opts a route into dynamic
 * rendering, which every page that shows a live pot already is.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  const accept = (await headers()).get("accept-language") ?? "";
  // "es-419,es;q=0.9,en;q=0.8" — first tag wins if it's Spanish.
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("es")) return "es";

  return DEFAULT_LOCALE;
}

/** Locale + strings in one call, for server components. */
export async function getT(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: dictFor(locale) };
}
