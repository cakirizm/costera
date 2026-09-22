import { AppMetric, COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import { getAppLocale, tx } from "@/lib/costera/i18n";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export default async function FinancePage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;

  if (!input) {
    return (
      <COSTERAAppShell active="/dashboard/finance" locale={locale} title={tx(locale, "Finance", "Finans")} eyebrow={tx(locale, "NO LIVE SOURCE", "CANLI VERİ KAYNAĞI YOK")}>
        <div className="costera-metrics five">
          <AppMetric label={tx(locale, "Net Sales", "Net Satış")} value="$0" meta={tx(locale, "No connected source", "Bağlı veri kaynağı yok")} />
          <AppMetric label="COGS" value="$0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Gross Profit", "Brüt Kâr")} value="$0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Operating Expenses", "Operasyon Giderleri")} value="$0" meta={tx(locale, "No expenses yet", "Henüz gider yok")} />
          <AppMetric label={tx(locale, "Estimated Net Profit", "Tahmini Net Kâr")} value="$0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
        </div>
        <EmptyWorkspace
          locale={locale}
          title={tx(locale, "Finance is waiting for a data source.", "Finans bir veri kaynağı bekliyor.")}
          text={tx(locale, "Connect a source or import files. COSTERA builds a live management P&L from sales and food cost.", "Bir kaynak bağlayın veya dosya içe aktarın. COSTERA satış ve food cost'tan canlı bir yönetim P&L'i oluşturur.")}
        />
      </COSTERAAppShell>
    );
  }

  const analysis = analyzeCost(input);
  const netSales = analysis.totals.netSales;
  const cogs = analysis.totals.actualCost;
  const grossProfit = netSales - cogs;
  // Operating expenses (rent, utilities, payroll…) are added in Finance — Phase 4.
  const operatingExpenses = 0;
  const netProfit = grossProfit - operatingExpenses;
  const pct = (n: number) => (netSales > 0 ? ((n / netSales) * 100).toFixed(1) : "0.0");

  return (
    <COSTERAAppShell active="/dashboard/finance" locale={locale} title={tx(locale, "Finance", "Finans")} eyebrow={tx(locale, "LIVE MANAGEMENT P&L", "CANLI YÖNETİM P&L")}>
      <div className="costera-metrics five">
        <AppMetric label={tx(locale, "Net Sales", "Net Satış")} value={money(netSales)} meta={input.period.from + " → " + input.period.to} tone="good" />
        <AppMetric label="COGS" value={money(cogs)} meta={pct(cogs) + "% " + tx(locale, "of sales", "satışların")} tone="bad" />
        <AppMetric label={tx(locale, "Gross Profit", "Brüt Kâr")} value={money(grossProfit)} meta={pct(grossProfit) + "% " + tx(locale, "gross margin", "brüt marj")} tone="good" />
        <AppMetric label={tx(locale, "Operating Expenses", "Operasyon Giderleri")} value={money(operatingExpenses)} meta={tx(locale, "Add expenses to include", "Dahil etmek için gider ekleyin")} />
        <AppMetric label={tx(locale, "Estimated Net Profit", "Tahmini Net Kâr")} value={money(netProfit)} meta={pct(netProfit) + "% " + tx(locale, "net margin", "net marj")} tone="good" />
      </div>

      <section className="costera-grid finance-layout">
        <article className="costera-panel span-2">
          <div className="costera-panel-head"><div><span>{tx(locale, "MANAGEMENT P&L", "YÖNETİM P&L")}</span><h2>{tx(locale, "Period profitability", "Dönem kârlılığı")}</h2></div></div>
          <div className="costera-pnl">
            <div className="total"><span>{tx(locale, "Net Sales", "Net Satış")}</span><b>{money(netSales)}</b></div>
            <div><span>{tx(locale, "Food COGS", "Yiyecek COGS")}</span><b>-{money(cogs)}</b></div>
            <div className="subtotal"><span>{tx(locale, "Gross Profit", "Brüt Kâr")}</span><b>{money(grossProfit)}</b></div>
            <div className="profit"><span>{tx(locale, "Estimated Net Profit", "Tahmini Net Kâr")}</span><b>{money(netProfit)}</b></div>
          </div>
        </article>

        <article className="costera-panel">
          <div className="costera-panel-head"><div><span>{tx(locale, "OPERATING EXPENSES", "OPERASYON GİDERLERİ")}</span><h2>{tx(locale, "Where the money goes", "Para nereye gidiyor")}</h2></div></div>
          <div className="finance-expense-empty">
            <p>{tx(locale, "No operating expenses added yet.", "Henüz operasyon gideri eklenmedi.")}</p>
            <span>{tx(locale, "Rent, utilities, payroll and other costs will appear here once expense entry is available.", "Kira, elektrik, personel ve diğer giderler; gider girişi eklendiğinde burada görünecek.")}</span>
          </div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
