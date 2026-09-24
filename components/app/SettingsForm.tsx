"use client";

import { useActionState } from "react";
import { updateTargetsAction, updateRestaurantAction, type SettingsState } from "@/lib/settings-actions";
import { tx } from "@/lib/costera/i18n";
import type { AppLocale } from "@/lib/costera/i18n";

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

export function RestaurantForm({ locale, name, city }: { locale: AppLocale; name: string; city: string }) {
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
      <button type="submit" disabled={pending} className="costera-settings-save">
        {pending ? tx(locale, "Saving…", "Kaydediliyor…") : tx(locale, "Save", "Kaydet")}
      </button>
      {state.ok && <small className="costera-settings-success">{tx(locale, "Saved!", "Kaydedildi!")}</small>}
      {state.error && <small className="costera-settings-error">{state.error}</small>}
    </form>
  );
}
