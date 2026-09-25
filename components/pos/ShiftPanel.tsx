"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { posFailureText } from "@/lib/pos/messages";
import { moneyMinor } from "@/lib/pos/money";
import type { ShiftSummary } from "@/lib/pos/shift-service";
import { addCashMovementAction, closeShiftAction, openShiftAction } from "@/lib/pos-actions";

type OpenShift = {
  id: string;
  openedAt: string;
  openingCashMinor: number;
  summary: ShiftSummary;
  movements: { id: string; type: string; amountMinor: number; reason: string }[];
  unpaidCount: number;
};

const METHOD_LABELS: Record<string, { en: string; tr: string }> = {
  CASH: { en: "Cash", tr: "Nakit" },
  CARD: { en: "Card", tr: "Kredi kartı" },
  MEAL_CARD: { en: "Meal card", tr: "Yemek kartı" },
  ONLINE: { en: "Online", tr: "Online" },
  ON_ACCOUNT: { en: "On account", tr: "Cari hesap" },
};

export function ShiftPanel({
  locale,
  currency,
  shift,
}: {
  locale: AppLocale;
  currency: string;
  shift: OpenShift | null;
}) {
  const router = useRouter();
  const [openingText, setOpeningText] = useState("0.00");
  const [countedText, setCountedText] = useState("");
  const [movementText, setMovementText] = useState("");
  const [movementReason, setMovementReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const money = (minor: number) => moneyMinor(minor, currency);
  const parseMinor = (text: string): number => {
    const value = Number(text.replace(",", "."));
    return Number.isFinite(value) ? Math.round(value * 100) : 0;
  };

  const act = (work: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await work();
      if (!result.ok) setError(result.error ?? "INVALID_INPUT");
      else router.refresh();
    });

  if (!shift) {
    return (
      <main className="pos-main">
        <div className="pos-shift">
          <div className="pos-section-head">
            <span>{tx(locale, "DRAWER", "KASA")}</span>
            <h2>{tx(locale, "Open a shift", "Vardiya aç")}</h2>
          </div>
          {error && <p className="pos-error">{posFailureText(error, locale)}</p>}
          <div className="pos-shift-block">
            <p style={{ color: "var(--pos-muted)", marginTop: 0, lineHeight: 1.6 }}>
              {tx(
                locale,
                "Sales taken without an open shift are not counted into any drawer. Open one with the cash the till starts with.",
                "Açık vardiya yokken alınan satışlar hiçbir kasaya sayılmaz. Kasadaki başlangıç nakdiyle bir vardiya açın.",
              )}
            </p>
            <label className="pos-field">
              <span>{tx(locale, "Opening cash", "Açılış nakdi")}</span>
              <input
                inputMode="decimal"
                value={openingText}
                onChange={(event) => setOpeningText(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="pos-btn primary block"
              disabled={pending}
              onClick={() => act(() => openShiftAction(parseMinor(openingText)))}
            >
              {tx(locale, "Open shift", "Vardiyayı aç")}
            </button>
          </div>
          <button type="button" className="pos-btn ghost block" onClick={() => router.push("/pos")}>
            {tx(locale, "Back to tables", "Masalara dön")}
          </button>
        </div>
      </main>
    );
  }

  const { summary } = shift;
  const countedMinor = countedText.trim() === "" ? null : parseMinor(countedText);
  const differenceMinor = countedMinor === null ? null : countedMinor - summary.expectedCashMinor;

  return (
    <main className="pos-main">
      <div className="pos-shift">
        <div className="pos-section-head">
          <span>{tx(locale, "OPEN SINCE", "AÇILIŞ")} {new Date(shift.openedAt).toLocaleTimeString()}</span>
          <h2>{tx(locale, "Shift", "Vardiya")}</h2>
        </div>

        {error && <p className="pos-error">{posFailureText(error, locale)}</p>}

        <div className="pos-shift-cards">
          <div className="pos-shift-card gold">
            <small>{tx(locale, "TAKINGS", "CİRO")}</small>
            <strong>{money(summary.grossMinor)}</strong>
          </div>
          <div className="pos-shift-card">
            <small>{tx(locale, "TICKETS", "ADİSYON")}</small>
            <strong>{summary.orderCount}</strong>
          </div>
          <div className="pos-shift-card">
            <small>{tx(locale, "EXPECTED CASH", "BEKLENEN NAKİT")}</small>
            <strong>{money(summary.expectedCashMinor)}</strong>
          </div>
        </div>

        <div className="pos-shift-block">
          <h3>{tx(locale, "By payment method", "Ödeme yöntemine göre")}</h3>
          {summary.byMethod.length === 0 && (
            <p style={{ color: "var(--pos-muted)", margin: 0 }}>
              {tx(locale, "No payments yet.", "Henüz ödeme yok.")}
            </p>
          )}
          {summary.byMethod.map((row) => (
            <div key={row.method} className="pos-shift-row">
              <span>
                {METHOD_LABELS[row.method]
                  ? tx(locale, METHOD_LABELS[row.method].en, METHOD_LABELS[row.method].tr)
                  : row.method}{" "}
                <span style={{ color: "var(--pos-muted)" }}>({row.count})</span>
              </span>
              <b>{money(row.amountMinor)}</b>
            </div>
          ))}
        </div>

        <div className="pos-shift-block">
          <h3>{tx(locale, "Cash in / out", "Kasa giriş / çıkış")}</h3>
          <div className="pos-shift-row">
            <span>{tx(locale, "Opening cash", "Açılış nakdi")}</span>
            <b>{money(shift.openingCashMinor)}</b>
          </div>
          <div className="pos-shift-row">
            <span>{tx(locale, "Cash takings", "Nakit tahsilat")}</span>
            <b>{money(summary.cashPaymentsMinor)}</b>
          </div>
          <div className="pos-shift-row">
            <span>{tx(locale, "Paid in", "Kasaya giren")}</span>
            <b>{money(summary.paidInMinor)}</b>
          </div>
          <div className="pos-shift-row">
            <span>{tx(locale, "Paid out", "Kasadan çıkan")}</span>
            <b>-{money(summary.paidOutMinor)}</b>
          </div>

          {shift.movements.map((movement) => (
            <div key={movement.id} className="pos-shift-row" style={{ fontSize: 13, color: "var(--pos-muted)" }}>
              <span>
                {movement.type === "PAID_IN" ? "+" : "-"} {movement.reason}
              </span>
              <span>{money(movement.amountMinor)}</span>
            </div>
          ))}

          <div className="pos-shift-grid2" style={{ marginTop: 14 }}>
            <label className="pos-field" style={{ margin: 0 }}>
              <span>{tx(locale, "Amount", "Tutar")}</span>
              <input
                inputMode="decimal"
                value={movementText}
                onChange={(event) => setMovementText(event.target.value)}
                placeholder="0.00"
              />
            </label>
            <label className="pos-field" style={{ margin: 0 }}>
              <span>{tx(locale, "Reason", "Gerekçe")}</span>
              <input
                value={movementReason}
                onChange={(event) => setMovementReason(event.target.value)}
                placeholder={tx(locale, "Supplier payment", "Tedarikçi ödemesi")}
              />
            </label>
          </div>
          <div className="pos-shift-grid2" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="pos-btn"
              disabled={pending}
              onClick={() =>
                act(async () => {
                  const result = await addCashMovementAction(
                    shift.id,
                    "PAID_IN",
                    parseMinor(movementText),
                    movementReason,
                  );
                  if (result.ok) {
                    setMovementText("");
                    setMovementReason("");
                  }
                  return result;
                })
              }
            >
              {tx(locale, "Cash in", "Kasaya gir")}
            </button>
            <button
              type="button"
              className="pos-btn"
              disabled={pending}
              onClick={() =>
                act(async () => {
                  const result = await addCashMovementAction(
                    shift.id,
                    "PAID_OUT",
                    parseMinor(movementText),
                    movementReason,
                  );
                  if (result.ok) {
                    setMovementText("");
                    setMovementReason("");
                  }
                  return result;
                })
              }
            >
              {tx(locale, "Cash out", "Kasadan çıkar")}
            </button>
          </div>
        </div>

        <div className="pos-shift-block">
          <h3>{tx(locale, "Close the shift", "Vardiyayı kapat")}</h3>

          {shift.unpaidCount > 0 && (
            <p className="pos-error" style={{ marginTop: 0 }}>
              {shift.unpaidCount}{" "}
              {tx(
                locale,
                "ticket(s) are still open. Settle them before counting the drawer.",
                "adisyon hâlâ açık. Kasayı saymadan önce bunları kapatın.",
              )}
            </p>
          )}

          <label className="pos-field">
            <span>{tx(locale, "Counted cash", "Sayılan nakit")}</span>
            <input
              inputMode="decimal"
              value={countedText}
              onChange={(event) => setCountedText(event.target.value)}
              placeholder="0.00"
            />
          </label>

          {differenceMinor !== null && (
            <div className={`pos-shift-card ${differenceMinor === 0 ? "good" : "bad"}`} style={{ marginBottom: 14 }}>
              <small>{tx(locale, "DIFFERENCE", "FARK")}</small>
              <strong>
                {differenceMinor > 0 ? "+" : ""}
                {money(differenceMinor)}
              </strong>
            </div>
          )}

          <button
            type="button"
            className="pos-btn primary block"
            disabled={pending || countedMinor === null || shift.unpaidCount > 0}
            onClick={() => act(() => closeShiftAction(shift.id, countedMinor ?? 0))}
          >
            {tx(locale, "Close shift", "Vardiyayı kapat")}
          </button>
        </div>

        <button type="button" className="pos-btn ghost block" onClick={() => router.push("/pos")}>
          {tx(locale, "Back to tables", "Masalara dön")}
        </button>
      </div>
    </main>
  );
}
