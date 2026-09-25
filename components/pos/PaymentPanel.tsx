"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { posFailureText } from "@/lib/pos/messages";
import { moneyMinor } from "@/lib/pos/money";
import { setOrderDiscountAction, takePaymentAction } from "@/lib/pos-actions";

type Method = "CASH" | "CARD" | "MEAL_CARD" | "ONLINE";

const METHODS: { value: Method; en: string; tr: string }[] = [
  { value: "CASH", en: "Cash", tr: "Nakit" },
  { value: "CARD", en: "Card", tr: "Kredi kartı" },
  { value: "MEAL_CARD", en: "Meal card", tr: "Yemek kartı" },
  { value: "ONLINE", en: "Online", tr: "Online" },
];

/** Notes a cashier reaches for first. Anything else is typed in. */
const QUICK_NOTES_MINOR = [5000, 10000, 20000, 50000];

export function PaymentPanel({
  locale,
  currency,
  dueMinor,
  order,
  payments,
}: {
  locale: AppLocale;
  currency: string;
  dueMinor: number;
  order: {
    id: string;
    code: number;
    status: string;
    subtotalMinor: number;
    discountMinor: number;
    taxMinor: number;
    totalMinor: number;
    paidMinor: number;
    lines: { id: string; name: string; quantity: number; lineTotalMinor: number }[];
  };
  payments: { id: string; method: string; amountMinor: number; changeMinor: number }[];
}) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("CASH");
  const [amountText, setAmountText] = useState((dueMinor / 100).toFixed(2));
  const [tenderedMinor, setTenderedMinor] = useState<number | null>(null);
  const [discountText, setDiscountText] = useState("");
  const [change, setChange] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const money = (minor: number) => moneyMinor(minor, currency);
  const settled = order.status === "PAID";

  const parseMinor = (text: string): number => {
    const value = Number(text.replace(",", "."));
    return Number.isFinite(value) ? Math.round(value * 100) : 0;
  };

  const amountMinor = parseMinor(amountText);

  const submit = (tendered?: number) =>
    startTransition(async () => {
      setError(null);
      const result = await takePaymentAction({
        orderId: order.id,
        method,
        amountMinor,
        tenderedMinor: method === "CASH" ? (tendered ?? amountMinor) : undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setChange(result.data.changeMinor);
      setTenderedMinor(null);
      setAmountText((result.data.remainingMinor / 100).toFixed(2));
      router.refresh();
    });

  return (
    <div className="pos-pay-layout">
      <aside className="pos-pay-summary">
        <div className="pos-section-head">
          <span>{tx(locale, "TICKET", "ADİSYON")}</span>
          <h2>#{order.code}</h2>
        </div>

        {order.lines.map((line) => (
          <div
            key={line.id}
            style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}
          >
            <span>
              {line.quantity}x {line.name}
            </span>
            <span>{money(line.lineTotalMinor)}</span>
          </div>
        ))}

        <div className="pos-cart-totals" style={{ padding: "14px 0 0" }}>
          <div>
            <span>{tx(locale, "Subtotal", "Ara toplam")}</span>
            <span>{money(order.subtotalMinor)}</span>
          </div>
          {order.discountMinor > 0 && (
            <div>
              <span>{tx(locale, "Discount", "İskonto")}</span>
              <span>-{money(order.discountMinor)}</span>
            </div>
          )}
          <div>
            <span>{tx(locale, "VAT included", "KDV dahil")}</span>
            <span>{money(order.taxMinor)}</span>
          </div>
          <div className="grand">
            <span>{tx(locale, "Total", "Toplam")}</span>
            <span>{money(order.totalMinor)}</span>
          </div>
        </div>

        {payments.length > 0 && (
          <ul className="pos-payment-list">
            {payments.map((payment) => (
              <li key={payment.id}>
                <span>{payment.method}</span>
                <span>{money(payment.amountMinor)}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="pos-pay-main">
        {error && <p className="pos-error">{posFailureText(error, locale)}</p>}

        {settled ? (
          <>
            <div className="pos-due">
              <small>{tx(locale, "Ticket settled", "Adisyon kapandı")}</small>
              <strong>{money(order.totalMinor)}</strong>
            </div>
            {change !== null && change > 0 && (
              <div className="pos-change">
                <small>{tx(locale, "Change", "Para üstü")}</small>
                <strong>{money(change)}</strong>
              </div>
            )}
            <button
              type="button"
              className="pos-btn primary block"
              style={{ marginTop: 20 }}
              onClick={() => router.push("/pos")}
            >
              {tx(locale, "Back to tables", "Masalara dön")}
            </button>
          </>
        ) : (
          <>
            <div className="pos-due">
              <small>{tx(locale, "Amount due", "Kalan tutar")}</small>
              <strong>{money(dueMinor)}</strong>
            </div>

            <div className="pos-method-grid">
              {METHODS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`pos-btn ${method === item.value ? "primary" : ""}`}
                  onClick={() => setMethod(item.value)}
                >
                  {tx(locale, item.en, item.tr)}
                </button>
              ))}
            </div>

            <label className="pos-field">
              <span>{tx(locale, "Amount to apply", "Uygulanacak tutar")}</span>
              <input
                inputMode="decimal"
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
              />
            </label>

            {method === "CASH" && (
              <>
                <div className="pos-quick-cash">
                  {QUICK_NOTES_MINOR.map((note) => (
                    <button
                      key={note}
                      type="button"
                      className="pos-btn"
                      disabled={pending || note < amountMinor}
                      onClick={() => setTenderedMinor(note)}
                    >
                      {money(note)}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pos-btn"
                    disabled={pending}
                    onClick={() => setTenderedMinor(amountMinor)}
                  >
                    {tx(locale, "Exact", "Tam")}
                  </button>
                </div>
                {tenderedMinor !== null && (
                  <p style={{ color: "var(--pos-muted)", fontSize: 14 }}>
                    {tx(locale, "Tendered", "Verilen")}: {money(tenderedMinor)} ·{" "}
                    {tx(locale, "Change", "Para üstü")}: {money(Math.max(0, tenderedMinor - amountMinor))}
                  </p>
                )}
              </>
            )}

            <button
              type="button"
              className="pos-btn good block"
              style={{ marginTop: 12, minHeight: 64, fontSize: 18 }}
              disabled={pending || amountMinor <= 0}
              onClick={() => submit(tenderedMinor ?? undefined)}
            >
              {tx(locale, "Take payment", "Ödemeyi al")} · {money(amountMinor)}
            </button>

            <div className="pos-section-head" style={{ marginTop: 28 }}>
              <span>{tx(locale, "ADJUST", "DÜZENLE")}</span>
              <h2>{tx(locale, "Ticket discount", "Adisyon iskontosu")}</h2>
            </div>
            <label className="pos-field">
              <span>{tx(locale, "Discount amount", "İskonto tutarı")}</span>
              <input
                inputMode="decimal"
                value={discountText}
                onChange={(event) => setDiscountText(event.target.value)}
                placeholder="0.00"
              />
            </label>
            <button
              type="button"
              className="pos-btn block"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await setOrderDiscountAction(order.id, parseMinor(discountText));
                  if (!result.ok) setError(result.error);
                  else {
                    setDiscountText("");
                    router.refresh();
                  }
                })
              }
            >
              {tx(locale, "Apply discount", "İskontoyu uygula")}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
