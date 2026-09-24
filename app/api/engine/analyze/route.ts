import { NextRequest, NextResponse } from "next/server";
import { analyzeCost } from "@/lib/costera/engine";
import { sampleInput } from "@/lib/costera/sample";
import { getSessionContext } from "@/lib/session";
import type { CosteraInput } from "@/lib/costera/types";

export const runtime = "nodejs";

const UNAUTHORIZED = NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

export async function GET() {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return UNAUTHORIZED;

    return NextResponse.json({
      ok: true,
      source: "sample",
      input: sampleInput,
      analysis: analyzeCost(sampleInput),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) return UNAUTHORIZED;

  try {
    const input = (await request.json()) as CosteraInput;

    if (
      !input ||
      !Array.isArray(input.ingredients) ||
      !Array.isArray(input.menuItems) ||
      !Array.isArray(input.sales) ||
      !Array.isArray(input.inventory)
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid COSTERA payload." },
        { status: 400 },
      );
    }

    const analysis = analyzeCost(input);
    return NextResponse.json({ ok: true, analysis });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to analyze payload.",
      },
      { status: 400 },
    );
  }
}
