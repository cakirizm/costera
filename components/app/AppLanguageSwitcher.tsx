"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppLocale } from "@/lib/costera/i18n";

export function AppLanguageSwitcher({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setLocale = async (next: AppLocale) => {
    if (next === locale || loading) return;
    setLoading(true);
    try {
      await fetch("/api/app-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"costera-language-toggle " + (loading ? "loading" : "")} aria-label="Application language">
      <button
        type="button"
        className={locale === "en" ? "active" : ""}
        onClick={() => setLocale("en")}
      >
        <span className="costera-flag">🇬🇧</span>
        EN
      </button>
      <button
        type="button"
        className={locale === "tr" ? "active" : ""}
        onClick={() => setLocale("tr")}
      >
        <span className="costera-flag">🇹🇷</span>
        TR
      </button>
    </div>
  );
}
