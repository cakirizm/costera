import { AppMetric, COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { analyzeCost } from "@/lib/costera/engine";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput, getExpenses } from "@/lib/costera/repository";
import { ExpenseManager, type ExpenseItem } from "@/components/app/ExpenseManager";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { money } from "@/lib/format";

const CATEGORY_LABELS: Record<string, { en: string; tr: string }> = {
  RENT: { en: "Rent", tr: "Kira" },
  UTILITIES: { en: "Utilities", tr: "Elektrik / Su / Doğalgaz" },
  PAYROLL: { en: "Payroll", tr: "Personel" },
  DELIVERY_FEES: { en: "Delivery fees", tr: "Delivery ücretleri" },
  MARKETING: { en: "Marketing", tr: "Pazarlama" },
  OTHER: { en: "Other operating", tr: "Diğer operasyon" },
};

export default async function FinancePage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const restaurantId = ctx?.restaurant?.id ?? null;

  const input = restaurantId ? await getRestaurantInput(restaurantId) : null;
  const expenseRecords = restaurantId ? await getExpenses(restaurantId) : [];

  const expenses: ExpenseItem[] = expenseRecords.map((e) => ({
    id: e.id,
    category: e.category,
    label: e.label,
    amount: e.amount,
    incurredOn: e.incurredOn.toISOString().slice(0, 10),
  }));

  const analysis = input ? analyzeCost(input) : null;
  const netSales = analysis?.totals.netSales ?? 0;
  const cogs = analysis?.totals.actualCost ?? 0;
  const grossProfit = netSales - cogs;
  const operatingExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - operatingExpenses;
  const pct = (n: number) => (netSales > 0 ? ((n / netSales) * 100).toFixed(1) : "0.0");

  // Expenses grouped by category for the P&L and cost mix.
  const byCategory = new Map<string, number>();
  for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
  const categoryRows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...categoryRows.map(([, v]) => v), 1);
  const catLabel = (c: string) => tx(locale, CATEGORY_LABELS[c]?.en ?? c, CATEGORY_LABELS[c]?.tr ?? c);

  return (
    <COSTERAAppShell active="/dashboard/finance" locale={locale} title={tx(locale, "Finance", "Finans")} eyebrow={tx(locale, "LIVE MANAGEMENT P&L", "CANLI YÖNETİM P&L")}>
      <div className="costera-metrics five">
        <AppMetric label={tx(locale, "Net Sales", "Net Satış")} value={money(netSales)} meta={input ? input.period.from + " → " + input.period.to : tx(locale, "No connected source", "Bağlı veri kaynağı yok")} tone="good" />
        <AppMetric label="COGS" value={money(cogs)} meta={pct(cogs) + "% " + tx(locale, "of sales", "satışların")} tone="bad" />
        <AppMetric label={tx(locale, "Gross Profit", "Brüt Kâr")} value={money(grossProfit)} meta={pct(grossProfit) + "% " + tx(locale, "gross margin", "brüt marj")} tone="good" />
        <AppMetric label={tx(locale, "Operating Expenses", "Operasyon Giderleri")} value={money(operatingExpenses)} meta={expenses.length + " " + tx(locale, "expenses", "gider")} />
        <AppMetric label={tx(locale, "Estimated Net Profit", "Tahmini Net Kâr")} value={money(netProfit)} meta={pct(netProfit) + "% " + tx(locale, "net margin", "net marj")} tone={netProfit >= 0 ? "good" : "bad"} />
      </div>

      <section className="costera-grid finance-layout">
        <article className="costera-panel span-2">
          <div className="costera-panel-head"><div><span>{tx(locale, "MANAGEMENT P&L", "YÖNETİM P&L")}</span><h2>{tx(locale, "Period profitability", "Dönem kârlılığı")}</h2></div></div>
          <div className="costera-pnl">
            <div className="total"><span>{tx(locale, "Net Sales", "Net Satış")}</span><b>{money(netSales)}</b></div>
            <div><span>{tx(locale, "Food COGS", "Yiyecek COGS")}</span><b>-{money(cogs)}</b></div>
            <div className="subtotal"><span>{tx(locale, "Gross Profit", "Brüt Kâr")}</span><b>{money(grossProfit)}</b></div>
            {categoryRows.map(([cat, amount]) => (
              <div key={cat}><span>{catLabel(cat)}</span><b>-{money(amount)}</b></div>
            ))}
            <div className="profit"><span>{tx(locale, "Estimated Net Profit", "Tahmini Net Kâr")}</span><b>{money(netProfit)}</b></div>
          </div>
        </article>

        <article className="costera-panel">
          <div className="costera-panel-head"><div><span>{tx(locale, "COST MIX", "MALİYET DAĞILIMI")}</span><h2>{tx(locale, "Where the money goes", "Para nereye gidiyor")}</h2></div></div>
          {categoryRows.length === 0 ? (
            <div className="finance-expense-empty">
              <p>{tx(locale, "No operating expenses yet.", "Henüz operasyon gideri yok.")}</p>
              <span>{tx(locale, "Add expenses below to see the cost breakdown.", "Dağılımı görmek için aşağıdan gider ekleyin.")}</span>
            </div>
          ) : (
            <div className="costera-expense-bars">
              {categoryRows.map(([cat, amount]) => (
                <div key={cat}>
                  <p><span>{catLabel(cat)}</span><b>{money(amount)}</b></p>
                  <i><em style={{ width: Math.max(6, (amount / maxCat) * 100) + "%" }} /></i>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="costera-panel finance-expense-panel">
        <div className="costera-panel-head"><div><span>{tx(locale, "EXPENSE ENTRY", "GİDER GİRİŞİ")}</span><h2>{tx(locale, "Add rent, utilities, payroll and other costs", "Kira, elektrik, personel ve diğer giderleri ekleyin")}</h2></div></div>
        <ExpenseManager expenses={expenses} locale={locale} />
      </section>
    </COSTERAAppShell>
  );
}
