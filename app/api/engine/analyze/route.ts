import { NextRequest, NextResponse } from "next/server";
import { analyzeCost } from "@/lib/costera/engine";
import { sampleInput } from "@/lib/costera/sample";
import type { CosteraInput } from "@/lib/costera/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    source: "sample",
    input: sampleInput,
    analysis: analyzeCost(sampleInput),
  });
}

export async function POST(request: NextRequest) {
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
