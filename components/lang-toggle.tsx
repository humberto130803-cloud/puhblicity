"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocale } from "@/components/locale-provider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/types";

/**
 * EN / ES. Writes the choice to a cookie and re-renders on the server, so
 * the whole page — including everything rendered server-side — comes back
 * in the new language. No URL change, so a link someone shares still works
 * and still autodetects for whoever opens it.
 */
export function LangToggle({ dark = false }: { dark?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pick(next: Locale) {
    if (next === locale) return;
    // A year, root path: the choice should outlive the session.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      className={`lang-toggle${dark ? " on-dark" : ""}${pending ? " is-pending" : ""}`}
      role="group"
      aria-label={locale === "es" ? "Idioma" : "Language"}
    >
      {(["en", "es"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={locale === l}
          lang={l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
