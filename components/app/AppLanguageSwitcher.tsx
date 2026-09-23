"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { locales, type AppLocale } from "@/lib/costera/locale";

export function AppLanguageSwitcher({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  async function setLocale(next: AppLocale) {
    if (next === locale || loading) return;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/app-language", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: next }) });
      if (!response.ok) throw new Error("Language update failed");
      router.refresh();
    } catch { setError(true); }
    finally { setLoading(false); }
  }
  return <div>
    <div className={"costera-language-toggle " + (loading ? "loading" : "")} aria-label={locale === "ar" ? "لغة التطبيق" : "Application language"} aria-busy={loading}>
      {locales.map((item) => <button key={item} type="button" lang={item} aria-pressed={locale === item} disabled={loading} className={locale === item ? "active" : ""} onClick={() => setLocale(item)}>{item === "ar" ? "العربية" : item.toUpperCase()}</button>)}
    </div>
    {error && <small role="alert">{locale === "ar" ? "تعذر تغيير اللغة. حاول مجددًا." : locale === "tr" ? "Dil değiştirilemedi. Tekrar deneyin." : "Could not change language. Try again."}</small>}
  </div>;
}
