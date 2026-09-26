"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export type SettingsState = { error?: string; ok?: boolean };

const targetsSchema = z.object({
  targetFoodCostPct: z.coerce.number().min(1).max(100),
});

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "TRY", "AED", "SAR"] as const;

const restaurantSchema = z.object({
  name: z.string().trim().min(1).max(200),
  city: z.string().trim().max(200).optional(),
  currency: z.enum(SUPPORTED_CURRENCIES).optional(),
  // "" means no fiscal device: the POS prints information dockets only.
  fiscalProvider: z.enum(["", "simulator"]).optional(),
});

export async function updateTargetsAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const ctx = await requireRole("OWNER");
  const restaurantId = ctx.restaurant?.id;
  if (!restaurantId) return { error: "Çalışma alanı bulunamadı." };

  const parsed = targetsSchema.safeParse({
    targetFoodCostPct: formData.get("targetFoodCostPct"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz değer." };

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { targetFoodCostPct: parsed.data.targetFoodCostPct },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/variance");
  return { ok: true };
}

export async function updateRestaurantAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const ctx = await requireRole("OWNER");
  const restaurantId = ctx.restaurant?.id;
  if (!restaurantId) return { error: "Çalışma alanı bulunamadı." };

  const parsed = restaurantSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    currency: formData.get("currency") || undefined,
    fiscalProvider: (formData.get("fiscalProvider") as string | null) ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz değer." };

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      name: parsed.data.name,
      city: parsed.data.city ?? null,
      ...(parsed.data.currency ? { currency: parsed.data.currency } : {}),
      ...(parsed.data.fiscalProvider !== undefined
        ? { fiscalProvider: parsed.data.fiscalProvider || null }
        : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
