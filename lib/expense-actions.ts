"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export type ExpenseState = { error?: string; ok?: boolean };

const CATEGORIES = ["RENT", "UTILITIES", "PAYROLL", "DELIVERY_FEES", "MARKETING", "OTHER"] as const;

const expenseSchema = z.object({
  category: z.enum(CATEGORIES),
  label: z.string().trim().min(1, "Açıklama gerekli").max(120),
  amount: z.coerce.number().positive("Tutar 0'dan büyük olmalı").max(100_000_000),
  incurredOn: z.coerce.date(),
});

export async function addExpenseAction(_prev: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const ctx = await requireRole("OWNER", "FINANCE");
  const restaurantId = ctx.restaurant?.id;
  if (!restaurantId) return { error: "Çalışma alanı bulunamadı." };

  const parsed = expenseSchema.safeParse({
    category: formData.get("category"),
    label: formData.get("label"),
    amount: formData.get("amount"),
    incurredOn: formData.get("incurredOn") || new Date().toISOString().slice(0, 10),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz gider bilgisi" };
  }

  await prisma.expense.create({
    data: {
      restaurantId,
      category: parsed.data.category,
      label: parsed.data.label,
      amount: parsed.data.amount,
      incurredOn: parsed.data.incurredOn,
    },
  });

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteExpenseAction(id: string): Promise<ExpenseState> {
  const ctx = await requireRole("OWNER", "FINANCE");
  const restaurantId = ctx.restaurant?.id;
  if (!restaurantId) return { error: "Çalışma alanı bulunamadı." };

  // Ownership guard: only delete an expense that belongs to this restaurant.
  const result = await prisma.expense.deleteMany({ where: { id, restaurantId } });
  if (result.count === 0) return { error: "Gider bulunamadı." };

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard");
  return { ok: true };
}
