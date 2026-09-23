import { analyzeCost } from "@/lib/costera/engine";
import type { CosteraInput } from "@/lib/costera/types";
import type { MobileOverview } from "@/shared/mobile-contract";

type Source = { kind: "DEMO" | "IMPORT" | "POS_API"; provider: string; syncedAt: Date };
type Expense = { amount: number; incurredOn: Date };
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function buildMobileOverview(args: {
  restaurantId: string; locationId: string | null; input: CosteraInput | null;
  source: Source | null; expenses: Expense[]; now?: Date;
}): MobileOverview {
  const { restaurantId, locationId, input, source, expenses } = args;
  const now = args.now ?? new Date();
  const result: MobileOverview = {
    restaurantId, locationId, generatedAt: now.toISOString(), period: input?.period ?? null, currency: "USD",
    scope: locationId === null ? "restaurant" : "branch-sales-only", kpis: null, channels: [], alerts: [],
    source: source ? { kind: source.kind, provider: source.provider, syncedAt: source.syncedAt.toISOString(),
      state: source.kind === "DEMO" ? "demo" : source.kind === "IMPORT" ? "imported"
        : now.getTime() - source.syncedAt.getTime() > 5 * 60 * 1000 ? "stale" : "recent" } : null,
  };
  if (!input) return result;
  const scoped = locationId === null ? input : { ...input, locationId, sales: input.sales.filter(s => s.locationId === locationId), inventory: [] };
  const analysis = analyzeCost(scoped);
  // Never compare one branch's sales with restaurant-wide inventory or expenses.
  const global = locationId === null;
  const expenseTotal = expenses.filter(e => {
    const day = e.incurredOn.toISOString().slice(0, 10);
    return day >= input.period.from && day <= input.period.to;
  }).reduce((sum, e) => sum + e.amount, 0);
  result.kpis = {
    netSales: analysis.totals.netSales, unitsSold: round(scoped.sales.reduce((sum, s) => sum + s.quantity, 0)),
    theoreticalCost: analysis.totals.theoreticalCost, targetFoodCostPct: input.targetFoodCostPct,
    actualFoodCostPct: global && analysis.totals.netSales > 0 ? analysis.totals.actualFoodCostPct : null,
    unexplainedCost: global ? analysis.totals.unexplainedCost : null,
    operatingExpenses: global ? round(expenseTotal) : null,
    netProfit: global ? round(analysis.totals.netSales - analysis.totals.actualCost - expenseTotal) : null,
  };
  const menu = new Map(input.menuItems.map(m => [m.id, m]));
  const channels = new Map<string, number>();
  for (const sale of scoped.sales) {
    channels.set(sale.channel, (channels.get(sale.channel) ?? 0) + (sale.netSales ?? sale.quantity * (menu.get(sale.menuItemId)?.sellingPrice ?? 0)));
  }
  result.channels = [...channels].map(([name, sales]) => ({ name, sales: round(sales) })).sort((a,b) => b.sales-a.sales);
  if (global) {
    result.alerts = analysis.ingredientVariance.filter(row => row.risk !== "Low").map(row => ({
      id: `variance:${row.ingredientId}`, kind: "variance", severity: row.risk === "High" ? "high" : "medium",
      subject: row.ingredient, value: row.unexplainedValue,
    }));
    if (analysis.totals.netSales > 0 && analysis.totals.targetGapPp > 0) result.alerts.unshift({
      id: "above-target", kind: "above-target", severity: "high", subject: "", value: analysis.totals.targetGapPp,
    });
  }
  for (const subject of analysis.dataQuality.missingMenuItems) result.alerts.push({ id: `menu:${subject}`, kind: "missing-menu", severity: "medium", subject, value: null });
  for (const subject of analysis.dataQuality.missingIngredients) result.alerts.push({ id: `ingredient:${subject}`, kind: "missing-ingredient", severity: "medium", subject, value: null });
  return result;
}
