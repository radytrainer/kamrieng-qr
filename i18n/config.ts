export const LOCALES = ["km", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/** Last-resort fallback only — middleware primes the real per-section
 * default (km for public pages, en for admin) before this is ever read. */
export const DEFAULT_LOCALE: Locale = "km";

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
