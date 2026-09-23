import arabic from "./ar.json";

export const locales = ["en", "tr", "ar"] as const;
export type AppLocale = (typeof locales)[number];
export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && locales.some((locale) => locale === value);
}
export function translateArabic(text: string): string {
  return (arabic as Record<string, string>)[text] ?? text;
}
export function tx(locale: AppLocale, en: string, tr: string) {
  return locale === "ar" ? translateArabic(en) : locale === "tr" ? tr : en;
}
/** Translate copy values only; object keys and unknown identifiers stay intact. */
export function arabicCopy<T>(value: T): T {
  if (typeof value === "string") return translateArabic(value) as T;
  if (Array.isArray(value)) return value.map(arabicCopy) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, arabicCopy(item)])) as T;
  }
  return value;
}
export function localePath(locale: AppLocale, path = "/") {
  return locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;
}
