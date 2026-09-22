import { NextRequest, NextResponse } from "next/server";
import { sampleInput } from "@/lib/costera/sample";
import { analyzeCost } from "@/lib/costera/engine";

const COOKIE = "costera_polaris_demo";

function preview() {
  const analysis = analyzeCost(sampleInput);
  const channels = new Map<string, { orders: number; qty: number; sales: number }>();

  for (const sale of sampleInput.sales) {
    const current = channels.get(sale.channel) || { orders: 0, qty: 0, sales: 0 };
    current.orders += 1;
    current.qty += sale.quantity;
    current.sales += sale.netSales || 0;
    channels.set(sale.channel, current);
  }

  return {
    provider: "Polaris POS Demo",
    mode: "demo",
    syncedAt: new Date().toISOString(),
    records: {
      sales: sampleInput.sales.length,
      menuItems: sampleInput.menuItems.length,
      ingredients: sampleInput.ingredients.length,
      inventoryRows: sampleInput.inventory.length,
    },
    channels: [...channels.entries()].map(([channel, value]) => ({ channel, ...value })),
    totals: analysis.totals,
  };
}

export async function GET(request: NextRequest) {
  const connected = request.cookies.get(COOKIE)?.value === "1";
  return NextResponse.json({
    ok: true,
    connected,
    ...(connected ? { preview: preview() } : {}),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || "connect";
  const response = NextResponse.json({
    ok: true,
    connected: action !== "disconnect" && action !== "reset",
    action,
    ...(action !== "disconnect" && action !== "reset" ? { preview: preview() } : {}),
  });

  if (action === "disconnect" || action === "reset") {
    response.cookies.set(COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      httpOnly: true,
    });
  } else {
    response.cookies.set(COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      httpOnly: true,
    });
  }

  return response;
}
