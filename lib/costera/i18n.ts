import { cookies } from "next/headers";

export type AppLocale = "en" | "tr";

export async function getAppLocale(): Promise<AppLocale> {
  const store = await cookies();
  return store.get("costera_app_lang")?.value === "tr" ? "tr" : "en";
}

export function tx(locale: AppLocale, en: string, tr: string) {
  return locale === "tr" ? tr : en;
}
