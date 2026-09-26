import { StatusPill } from "@/components/app/COSTERAAppShell";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { venueTime } from "@/lib/pos/business-day";
import { moneyMinor } from "@/lib/pos/money";
import type { PosDaySummary } from "@/lib/pos/reports";

const METHOD_LABELS: Record<string, { en: string; tr: string }> = {
  CASH: { en: "Cash", tr: "Nakit" },
  CARD: { en: "Card", tr: "Kredi kartı" },
  MEAL_CARD: { en: "Meal card", tr: "Yemek kartı" },
  ONLINE: { en: "Online", tr: "Online" },
  ON_ACCOUNT: { en: "On account", tr: "Cari hesap" },
};

/**
 * Day close, as the owner reads it the morning after: what came in, how it was
 * paid, and whether each drawer balanced.
 */
export function PosDayReport({
  locale,
  currency,
  summary,
}: {
  locale: AppLocale;
  currency: string;
  summary: PosDaySummary;
}) {
  const money = (minor: number) => moneyMinor(minor, currency);

  return (
    <article className="costera-panel span-3">
      <div className="costera-panel-head">
        <div>
          <span>{tx(locale, "POS DAY CLOSE", "POS GÜN SONU")}</span>
          <h2>{summary.businessDay.toISOString().slice(0, 10)}</h2>
        </div>
      </div>

      <div className="costera-metrics four">
        <div className="costera-metric">
          <span>{tx(locale, "Takings", "Ciro")}</span>
          <b>{money(summary.grossMinor)}</b>
          <small>
            {summary.ticketCount} {tx(locale, "tickets", "adisyon")}
          </small>
        </div>
        <div className="costera-metric">
          <span>{tx(locale, "Average ticket", "Ortalama adisyon")}</span>
          <b>{money(summary.averageTicketMinor)}</b>
        </div>
        <div className="costera-metric">
          <span>{tx(locale, "Discounts", "İskontolar")}</span>
          <b>{money(summary.discountMinor)}</b>
          <small>
            {summary.compedLines} {tx(locale, "comped", "ikram")} · {summary.voidedLines}{" "}
            {tx(locale, "voided", "iptal")}
          </small>
        </div>
        <div className="costera-metric">
          <span>{tx(locale, "Shifts", "Vardiya")}</span>
          <b>{summary.shifts.length}</b>
        </div>
      </div>

      {summary.byMethod.length > 0 && (
        <div className="costera-table">
          <div className="costera-table-row head">
            <span>{tx(locale, "Payment method", "Ödeme yöntemi")}</span>
            <span>{tx(locale, "Count", "Adet")}</span>
            <span>{tx(locale, "Amount", "Tutar")}</span>
          </div>
          {summary.byMethod.map((row) => (
            <div className="costera-table-row" key={row.method}>
              <span>
                <b>
                  {METHOD_LABELS[row.method]
                    ? tx(locale, METHOD_LABELS[row.method].en, METHOD_LABELS[row.method].tr)
                    : row.method}
                </b>
              </span>
              <span>{row.count}</span>
              <span>{money(row.amountMinor)}</span>
            </div>
          ))}
        </div>
      )}

      {summary.shifts.length > 0 && (
        <div className="costera-table" style={{ marginTop: 18 }}>
          <div className="costera-table-row head">
            <span>{tx(locale, "Shift", "Vardiya")}</span>
            <span>{tx(locale, "Expected", "Beklenen")}</span>
            <span>{tx(locale, "Counted", "Sayılan")}</span>
            <span>{tx(locale, "Difference", "Fark")}</span>
            <span>{tx(locale, "Status", "Durum")}</span>
          </div>
          {summary.shifts.map((shift) => {
            const balanced = shift.differenceMinor === 0;
            return (
              <div className="costera-table-row" key={shift.id}>
                <span>
                  <b>{venueTime(shift.openedAt)}</b>
                </span>
                <span>{shift.expectedCashMinor === null ? "—" : money(shift.expectedCashMinor)}</span>
                <span>{shift.countedCashMinor === null ? "—" : money(shift.countedCashMinor)}</span>
                <span>
                  {shift.differenceMinor === null
                    ? "—"
                    : (shift.differenceMinor > 0 ? "+" : "") + money(shift.differenceMinor)}
                </span>
                <span>
                  {shift.status === "OPEN" ? (
                    <StatusPill tone="neutral">{tx(locale, "Open", "Açık")}</StatusPill>
                  ) : (
                    <StatusPill tone={balanced ? "good" : "warning"}>
                      {balanced ? tx(locale, "Balanced", "Denk") : tx(locale, "Check", "Kontrol et")}
                    </StatusPill>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {summary.topProducts.length > 0 && (
        <div className="costera-table" style={{ marginTop: 18 }}>
          <div className="costera-table-row head">
            <span>{tx(locale, "Top sellers", "En çok satanlar")}</span>
            <span>{tx(locale, "Sold", "Adet")}</span>
            <span>{tx(locale, "Takings", "Ciro")}</span>
          </div>
          {summary.topProducts.map((row) => (
            <div className="costera-table-row" key={row.name}>
              <span>
                <b>{row.name}</b>
              </span>
              <span>{row.quantity}</span>
              <span>{money(row.grossMinor)}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
