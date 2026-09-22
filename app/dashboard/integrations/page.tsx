import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { IntegrationStudio } from "@/components/app/IntegrationStudio";
import { getSessionContext } from "@/lib/session";
import { getDataSource, getRestaurantInput } from "@/lib/costera/repository";
import { analyzeCost } from "@/lib/costera/engine";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function IntegrationsPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const restaurantId = ctx?.restaurant?.id ?? null;

  const source = restaurantId ? await getDataSource(restaurantId) : null;
  const input = restaurantId && source ? await getRestaurantInput(restaurantId) : null;

  const preview = input
    ? (() => {
        const a = analyzeCost(input);
        return {
          provider: source!.provider,
          syncedAt: source!.syncedAt.toISOString(),
          records: {
            sales: input.sales.length,
            menuItems: input.menuItems.length,
            ingredients: input.ingredients.length,
            inventoryRows: input.inventory.length,
          },
          totals: {
            netSales: Math.round(a.totals.netSales),
            actualFoodCostPct: Number(a.totals.actualFoodCostPct.toFixed(1)),
            unexplainedCost: Math.round(a.totals.unexplainedCost),
          },
        };
      })()
    : null;

  return (
    <COSTERAAppShell
      active="/dashboard/integrations"
      locale={locale}
      title={tx(locale, "Integrations", "Entegrasyonlar")}
      eyebrow={tx(locale, "CONNECTION CONTROL", "BAĞLANTI KONTROLÜ")}
    >
      <IntegrationStudio locale={locale} connected={Boolean(source)} preview={preview} />
    </COSTERAAppShell>
  );
}
