import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SessionContext = {
  user: { id: string; name: string | null; email: string | null };
  restaurant: { id: string; name: string; city: string | null } | null;
  role: "OWNER" | "MANAGER" | "KITCHEN" | "FINANCE" | null;
  locationCount: number;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { restaurant: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    },
    restaurant: membership
      ? { id: membership.restaurant.id, name: membership.restaurant.name, city: membership.restaurant.city }
      : null,
    role: membership?.role ?? null,
    locationCount: 1,
  };
}

const ROLE_LABELS: Record<string, { en: string; tr: string }> = {
  OWNER: { en: "Owner", tr: "Sahip" },
  MANAGER: { en: "Manager", tr: "Yönetici" },
  KITCHEN: { en: "Kitchen", tr: "Mutfak" },
  FINANCE: { en: "Finance", tr: "Finans" },
};

export function roleLabel(role: string | null, tr: boolean): string {
  if (!role) return tr ? "Üye" : "Member";
  const entry = ROLE_LABELS[role];
  return entry ? (tr ? entry.tr : entry.en) : role;
}

export function initials(name: string | null, email: string | null): string {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
