"use client";

import { useActionState } from "react";
import { updateTargetsAction, updateRestaurantAction, type SettingsState } from "@/lib/settings-actions";
import { tx } from "@/lib/costera/locale";
import type { AppLocale } from "@/lib/costera/locale";

const initial: SettingsState = {};

export function TargetsForm({ locale, targetFoodCostPct }: { locale: AppLocale; targetFoodCostPct: number }) {
  const [state, action, pending] = useActionState(updateTargetsAction, initial);
  return (
    <form action={action} className="costera-form-stack">
      <label>
        {tx(locale, "Target Food Cost (%)", "Hedef Food Cost (%)")}
        <input name="targetFoodCostPct" type="number" step="0.1" min="1" max="100" defaultValue={targetFoodCostPct} disabled={pending} />
      </label>
      <button type="submit" disabled={pending} className="costera-settings-save">
        {pending ? tx(locale, "Saving…", "Kaydediliyor…") : tx(locale, "Save", "Kaydet")}
      </button>
      {state.ok && <small className="costera-settings-success">{tx(locale, "Saved!", "Kaydedildi!")}</small>}
      {state.error && <small className="costera-settings-error">{state.error}</small>}
    </form>
  );
}

const CURRENCIES = [
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
  { code: "TRY", label: "₺ TRY" },
  { code: "AED", label: "د.إ AED" },
  { code: "SAR", label: "﷼ SAR" },
];

export function RestaurantForm({ locale, name, city, currency }: { locale: AppLocale; name: string; city: string; currency: string }) {
  const [state, action, pending] = useActionState(updateRestaurantAction, initial);
  return (
    <form action={action} className="costera-form-stack">
      <label>
        {tx(locale, "Restaurant name", "Restoran adı")}
        <input name="name" type="text" defaultValue={name} disabled={pending} required />
      </label>
      <label>
        {tx(locale, "City", "Şehir")}
        <input name="city" type="text" defaultValue={city} disabled={pending} />
      </label>
      <label>
        {tx(locale, "Currency", "Para birimi")}
        <select name="currency" defaultValue={currency} disabled={pending}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending} className="costera-settings-save">
        {pending ? tx(locale, "Saving…", "Kaydediliyor…") : tx(locale, "Save", "Kaydet")}
      </button>
      {state.ok && <small className="costera-settings-success">{tx(locale, "Saved!", "Kaydedildi!")}</small>}
      {state.error && <small className="costera-settings-error">{state.error}</small>}
    </form>
  );
}
