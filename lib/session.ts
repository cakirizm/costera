import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type RoleType = "OWNER" | "MANAGER" | "KITCHEN" | "FINANCE" | "CASHIER" | "WAITER";

export type SessionContext = {
  user: { id: string; name: string | null; email: string | null };
  // The membership is what POS writes attribute to: every ticket, void and
  // cash movement names the staff member inside this restaurant, not the account.
  membershipId: string | null;
  restaurant: { id: string; name: string; city: string | null; currency: string } | null;
  role: RoleType | null;
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
    membershipId: membership?.id ?? null,
    restaurant: membership
      ? { id: membership.restaurant.id, name: membership.restaurant.name, city: membership.restaurant.city, currency: membership.restaurant.currency }
      : null,
    role: membership?.role ?? null,
    locationCount: 1,
  };
}

const ROLE_LABELS: Record<string, { en: string; tr: string; ar: string }> = {
  OWNER: { en: "Owner", tr: "Sahip", ar: "مالك" },
  MANAGER: { en: "Manager", tr: "Yönetici", ar: "مدير" },
  KITCHEN: { en: "Kitchen", tr: "Mutfak", ar: "مطبخ" },
  FINANCE: { en: "Finance", tr: "Finans", ar: "مالية" },
  CASHIER: { en: "Cashier", tr: "Kasiyer", ar: "أمين الصندوق" },
  WAITER: { en: "Waiter", tr: "Garson", ar: "نادل" },
};

const ROLE_ACCESS: Record<string, readonly RoleType[]> = {
  "/dashboard": ["OWNER", "MANAGER", "KITCHEN", "FINANCE"],
  "/dashboard/variance": ["OWNER", "MANAGER"],
  "/dashboard/inventory": ["OWNER", "MANAGER", "KITCHEN"],
  "/dashboard/recipes": ["OWNER", "MANAGER", "KITCHEN"],
  "/dashboard/pos": ["OWNER", "MANAGER"],
  "/dashboard/delivery": ["OWNER", "MANAGER"],
  "/dashboard/finance": ["OWNER", "FINANCE"],
  "/dashboard/purchasing": ["OWNER", "MANAGER"],
  "/dashboard/integrations": ["OWNER"],
  "/dashboard/settings": ["OWNER"],
  "/dashboard/reports": ["OWNER", "MANAGER", "FINANCE"],
  "/dashboard/import": ["OWNER", "MANAGER"],
  "/pos": ["OWNER", "MANAGER", "CASHIER", "WAITER"],
  "/pos/kds": ["OWNER", "MANAGER", "KITCHEN"],
  "/pos/shift": ["OWNER", "MANAGER", "CASHIER"],
};

export function hasAccess(role: RoleType | null, path: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ACCESS[path];
  if (!allowed) return true;
  return allowed.includes(role);
}

export async function requireRole(...allowed: RoleType[]): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) throw new Error("UNAUTHORIZED");
  if (allowed.length > 0 && (!ctx.role || !allowed.includes(ctx.role))) {
    throw new Error("FORBIDDEN");
  }
  return ctx;
}

export function roleLabel(role: string | null, locale: "en" | "tr" | "ar" | boolean): string {
  const lang = locale === true ? "tr" : locale === false ? "en" : locale;
  if (!role) return lang === "ar" ? "عضو" : lang === "tr" ? "Üye" : "Member";
  const entry = ROLE_LABELS[role];
  return entry ? entry[lang] : role;
}

export function initials(name: string | null, email: string | null): string {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
