import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { getRestaurantInput, getExpenses } from "@/lib/costera/repository";
import { analyzeCost } from "@/lib/costera/engine";
import { businessDayKey, venueTime } from "@/lib/pos/business-day";
import { moneyMinor } from "@/lib/pos/money";
import { getPosDaySummary } from "@/lib/pos/reports";

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) lines.push(row.map(escape).join(","));
  return lines.join("\n");
}

async function posDayCsv(restaurantId: string, currency: string): Promise<NextResponse> {
  const summary = await getPosDaySummary(restaurantId);
  const day = businessDayKey(summary.businessDay);
  const money = (minor: number) => moneyMinor(minor, currency);

  const rows: string[][] = [
    ["Business day", day],
    ["Tickets", String(summary.ticketCount)],
    ["Takings", money(summary.grossMinor)],
    ["Average ticket", money(summary.averageTicketMinor)],
    ["Discounts", money(summary.discountMinor)],
    ["Comped lines", String(summary.compedLines)],
    ["Voided lines", String(summary.voidedLines)],
    ["", ""],
    ["Payment method", "Count / Amount"],
    ...summary.byMethod.map((r) => [r.method, `${r.count} / ${money(r.amountMinor)}`]),
    ["", ""],
    ["Channel", "Tickets / Takings"],
    ...summary.byChannel.map((r) => [r.channel, `${r.ticketCount} / ${money(r.grossMinor)}`]),
    ["", ""],
    ["Shift opened", "Expected / Counted / Difference"],
    ...summary.shifts.map((s) => [
      venueTime(s.openedAt),
      s.countedCashMinor === null
        ? "still open"
        : `${money(s.expectedCashMinor ?? 0)} / ${money(s.countedCashMinor)} / ${money(s.differenceMinor ?? 0)}`,
    ]),
    ["", ""],
    ["Top seller", "Sold / Takings"],
    ...summary.topProducts.map((r) => [r.name, `${r.quantity} / ${money(r.grossMinor)}`]),
  ];

  return new NextResponse(toCsv(["Item", "Value"], rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="costera-pos-day-${day}.csv"`,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireRole("OWNER", "MANAGER", "FINANCE");
    const restaurantId = ctx.restaurant?.id;
    if (!restaurantId) {
      return NextResponse.json({ error: "No workspace" }, { status: 400 });
    }

    const type = request.nextUrl.searchParams.get("type") ?? "cost-summary";

    if (type === "pos-day") {
      return posDayCsv(restaurantId, ctx.restaurant?.currency ?? "TRY");
    }

    const input = await getRestaurantInput(restaurantId);
    if (!input) {
      return NextResponse.json({ error: "No data source connected" }, { status: 404 });
    }

    const analysis = analyzeCost(input);
    let csv: string;
    let filename: string;

    switch (type) {
      case "variance": {
        const headers = ["Ingredient", "Unit", "Expected Qty", "Actual Usage Qty", "Unexplained Qty", "Unexplained Value", "Variance %", "Risk", "Root Cause"];
        const rows = analysis.ingredientVariance.map((r) => [
          r.ingredient, r.unit,
          String(r.theoreticalQty), String(r.actualUsageQty),
          String(r.unexplainedQty), String(r.unexplainedValue),
          r.variancePct !== null ? r.variancePct.toFixed(1) + "%" : "N/A",
          r.risk, r.rootCause.action,
        ]);
        csv = toCsv(headers, rows);
        filename = "costera-variance-report.csv";
        break;
      }
      case "inventory": {
        const headers = ["Ingredient", "Unit", "Theoretical Qty", "Actual Usage Qty", "Known Waste Qty", "Unexplained Qty", "Unit Cost", "Unexplained Value"];
        const rows = analysis.ingredientVariance.map((r) => [
          r.ingredient, r.unit,
          String(r.theoreticalQty), String(r.actualUsageQty),
          String(r.knownWasteQty), String(r.unexplainedQty),
          String(r.unitCost), String(r.unexplainedValue),
        ]);
        csv = toCsv(headers, rows);
        filename = "costera-inventory-report.csv";
        break;
      }
      case "pnl": {
        const expenses = await getExpenses(restaurantId);
        const t = analysis.totals;
        const opex = expenses.reduce((s, e) => s + e.amount, 0);
        const headers = ["Line Item", "Amount"];
        const rows = [
          ["Net Sales", String(t.netSales)],
          ["Food COGS", String(-t.actualCost)],
          ["Gross Profit", String(t.netSales - t.actualCost)],
          ...expenses.map((e) => [e.label + " (" + e.category + ")", String(-e.amount)]),
          ["Estimated Net Profit", String(t.netSales - t.actualCost - opex)],
        ];
        csv = toCsv(headers, rows);
        filename = "costera-pnl-report.csv";
        break;
      }
      default: {
        const t = analysis.totals;
        const headers = ["Metric", "Value"];
        const rows = [
          ["Net Sales", String(t.netSales)],
          ["Theoretical Cost", String(t.theoreticalCost)],
          ["Actual Cost", String(t.actualCost)],
          ["Theoretical Food Cost %", t.theoreticalFoodCostPct.toFixed(1) + "%"],
          ["Actual Food Cost %", t.actualFoodCostPct.toFixed(1) + "%"],
          ["Known Waste Cost", String(t.knownWasteCost)],
          ["Unexplained Cost", String(t.unexplainedCost)],
        ];
        csv = toCsv(headers, rows);
        filename = "costera-cost-summary.csv";
      }
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "UNAUTHORIZED" || msg === "FORBIDDEN") {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
