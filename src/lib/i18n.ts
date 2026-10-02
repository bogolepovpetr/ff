export type Locale = "en" | "ru";

export const LOCALES: Locale[] = ["en", "ru"];
export const DEFAULT_LOCALE: Locale = "en";

export function normalizeLocale(loc: string | undefined): Locale {
  return (LOCALES as string[]).includes(loc as string) ? (loc as Locale) : DEFAULT_LOCALE;
}

/**
 * Builds a locale-aware path matching the site's URL scheme:
 * en is unprefixed ("/", "/races"), ru is prefixed ("/ru", "/ru/races").
 */
export function localizedPath(path: string, locale: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}
