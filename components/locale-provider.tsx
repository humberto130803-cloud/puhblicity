"use client";

import { createContext, useContext, type ReactNode } from "react";
import { en } from "@/lib/i18n/en";
import { es } from "@/lib/i18n/es";
import type { Dict } from "@/lib/i18n/en";
import type { Locale } from "@/lib/i18n/types";

/**
 * Both dictionaries are plain objects small enough to ship in the bundle,
 * so client components pick one by locale rather than having the server
 * serialise strings into every prop.
 */
const DICTS: Record<Locale, Dict> = { en, es };

const LocaleContext = createContext<{ locale: Locale; t: Dict }>({
  locale: "en",
  t: en,
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: DICTS[locale] ?? en }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** Strings for client components. */
export const useT = () => useContext(LocaleContext).t;
export const useLocale = () => useContext(LocaleContext).locale;
