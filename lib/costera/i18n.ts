import { cookies, headers } from "next/headers";
import { isAppLocale, type AppLocale } from "./locale";
export { tx } from "./locale";
export type { AppLocale } from "./locale";

export async function getAppLocale(): Promise<AppLocale> {
  const store = await cookies();
  const value = store.get("costera_app_lang")?.value;
  return isAppLocale(value) ? value : "en";
}
export async function getRequestLocale(): Promise<AppLocale> {
  const value = (await headers()).get("x-costera-locale");
  return isAppLocale(value) ? value : getAppLocale();
}
