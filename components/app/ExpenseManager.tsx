"use client";
import { tx } from "@/lib/costera/locale";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addExpenseAction, deleteExpenseAction, type ExpenseState } from "@/lib/expense-actions";
import type { AppLocale } from "@/lib/costera/i18n";

export type ExpenseItem = {
  id: string;
  category: string;
  label: string;
  amount: number;
  incurredOn: string;
};

const CATEGORY_LABELS: Record<string, { en: string; tr: string }> = {
  RENT: { en: "Rent", tr: "Kira" },
  UTILITIES: { en: "Utilities", tr: "Elektrik / Su / Doğalgaz" },
  PAYROLL: { en: "Payroll", tr: "Personel" },
  DELIVERY_FEES: { en: "Delivery fees", tr: "Delivery ücretleri" },
  MARKETING: { en: "Marketing", tr: "Pazarlama" },
  OTHER: { en: "Other operating", tr: "Diğer operasyon" },
};

const initial: ExpenseState = {};
const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export function ExpenseManager({ expenses, locale }: { expenses: ExpenseItem[]; locale: AppLocale }) {
  const t = (en: string, turkish: string) => tx(locale, en, turkish);
  const catLabel = (c: string) => tx(locale, CATEGORY_LABELS[c]?.en ?? c, CATEGORY_LABELS[c]?.tr ?? c);

  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (prev: ExpenseState, formData: FormData) => {
      const result = await addExpenseAction(prev, formData);
      if (result.ok) router.refresh();
      return result;
    },
    initial,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const remove = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteExpenseAction(id);
      router.refresh();
      setDeletingId(null);
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="expense-manager">
      <form action={action} className="expense-form">
        {state.error && <div className="expense-error" role="alert">{tx(locale, state.error, state.error)}</div>}
        <div className="expense-form-grid">
          <label>{t("Category", "Kategori")}
            <select name="category" defaultValue="RENT">
              {Object.keys(CATEGORY_LABELS).map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
            </select>
          </label>
          <label>{t("Description", "Açıklama")}
            <input name="label" placeholder={t("e.g. September rent", "örn. Eylül kirası")} required />
          </label>
          <label>{t("Amount", "Tutar")}
            <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
          </label>
          <label>{t("Date", "Tarih")}
            <input name="incurredOn" type="date" defaultValue={today} />
          </label>
          <button type="submit" disabled={pending}>{pending ? t("Adding…", "Ekleniyor…") : t("Add expense", "Gider ekle")}</button>
        </div>
      </form>

      {expenses.length === 0 ? (
        <div className="finance-expense-empty">
          <p>{t("No operating expenses added yet.", "Henüz operasyon gideri eklenmedi.")}</p>
          <span>{t("Add rent, utilities, payroll and other costs above to include them in net profit.", "Kira, elektrik, personel ve diğer giderleri yukarıdan ekleyin; net kâra dahil edilsin.")}</span>
        </div>
      ) : (
        <div className="expense-list">
          {expenses.map((e) => (
            <div className="expense-row" key={e.id}>
              <span className="expense-cat">{catLabel(e.category)}</span>
              <span className="expense-label">{e.label}</span>
              <span className="expense-date">{e.incurredOn}</span>
              <b className="expense-amount">{money(e.amount)}</b>
              <button type="button" onClick={() => remove(e.id)} disabled={deletingId === e.id} aria-label={t("Delete", "Sil")}>
                {deletingId === e.id ? "…" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
