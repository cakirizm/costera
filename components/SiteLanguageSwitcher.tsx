import { localePath, locales, type AppLocale } from "@/lib/costera/locale";

const names = { en: "English", tr: "Türkçe", ar: "العربية" };
export function SiteLanguageSwitcher({ locale, path }: { locale: AppLocale; path: string }) {
  return <nav className="site-language-options" aria-label={locale === "ar" ? "اللغة" : "Language"}>
    {locales.map((item) => <a key={item} href={localePath(item, path) + (/^\/(login|register|forgot-password|reset-password)$/.test(path) ? `?lang=${item}` : "")} hrefLang={item} lang={item} aria-current={locale === item ? "page" : undefined} title={names[item]}>{item === "ar" ? "العربية" : item.toUpperCase()}</a>)}
  </nav>;
}
