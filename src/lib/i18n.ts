import enDict from "@/i18n/en.json";
import ruDict from "@/i18n/ru.json";

export type Locale = "en" | "ru";

export const LOCALES: Locale[] = ["en", "ru"];
export const DEFAULT_LOCALE: Locale = "en";

export function normalizeLocale(loc: string | undefined): Locale {
  return (LOCALES as string[]).includes(loc as string) ? (loc as Locale) : DEFAULT_LOCALE;
}

type Dict = Record<string, string>;

const DICTS: Record<Locale, Dict> = {
  en: enDict as unknown as Dict,
  ru: ruDict as unknown as Dict,
};

export type TFn = (key: string, fallback?: string) => string;

/**
 * Returns a translation function bound to the given locale, reading from
 * src/i18n/{en,ru}.json. Falls back to English, then to the provided
 * fallback string, then to the raw key itself (so missing keys are visible
 * instead of silently blank).
 */
export function useT(lang: string | undefined): TFn {
  const loc = normalizeLocale(lang);
  const dict = DICTS[loc];
  const fallbackDict = DICTS[DEFAULT_LOCALE];
  return function t(key: string, fallback?: string): string {
    return dict[key] ?? fallbackDict[key] ?? fallback ?? key;
  };
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
