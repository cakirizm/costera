"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/session";
import { saveDataset, clearDataset } from "@/lib/costera/repository";
import { sampleInput } from "@/lib/costera/sample";
import type { CosteraInput } from "@/lib/costera/types";

export type DataActionResult = { ok: boolean; error?: string };

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/variance",
  "/dashboard/inventory",
  "/dashboard/delivery",
  "/dashboard/finance",
  "/dashboard/integrations",
];

function revalidateDashboards() {
  for (const path of DASHBOARD_PATHS) revalidatePath(path);
}

async function requireRestaurantId(): Promise<string | null> {
  const ctx = await getSessionContext();
  return ctx?.restaurant?.id ?? null;
}

export async function connectDemoAction(): Promise<DataActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { ok: false, error: "No workspace found." };

  await saveDataset(restaurantId, sampleInput, {
    kind: "DEMO",
    provider: "Universal POS Demo",
    syncedAt: new Date(),
  });
  revalidateDashboards();
  return { ok: true };
}

export async function disconnectDataAction(): Promise<DataActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { ok: false, error: "No workspace found." };

  await clearDataset(restaurantId);
  revalidateDashboards();
  return { ok: true };
}

export async function importDataAction(input: CosteraInput): Promise<DataActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { ok: false, error: "No workspace found." };

  if (!input || !Array.isArray(input.ingredients) || !Array.isArray(input.menuItems) || !Array.isArray(input.sales) || !Array.isArray(input.inventory)) {
    return { ok: false, error: "Invalid dataset." };
  }

  await saveDataset(restaurantId, input, {
    kind: "IMPORT",
    provider: "File import",
    syncedAt: new Date(),
  });
  revalidateDashboards();
  return { ok: true };
}
