import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TargetsForm, RestaurantForm } from "@/components/app/SettingsForm";
import { StaffManager } from "@/components/app/StaffManager";
import { listStaff } from "@/lib/pos/staff";

export default async function SettingsPage(){
 const locale = await getAppLocale();
 const ctx = await requireRole("OWNER");
 const restaurant = ctx.restaurant
   ? await prisma.restaurant.findUnique({ where: { id: ctx.restaurant.id }, select: { name: true, city: true, currency: true, targetFoodCostPct: true, fiscalProvider: true } })
   : null;
 const staff = ctx.restaurant ? await listStaff(ctx.restaurant.id) : [];

 return (
  <COSTERAAppShell active="/dashboard/settings" locale={locale} title={tx(locale,"Settings","Ayarlar")}>
   <section className="costera-grid settings-layout">
    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"COST CONTROL","MALİYET KONTROLÜ")}</span><h2>{tx(locale,"Targets","Hedefler")}</h2></div></div>
     <TargetsForm locale={locale} targetFoodCostPct={restaurant?.targetFoodCostPct ?? 25} />
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"ORGANIZATION","ORGANİZASYON")}</span><h2>{tx(locale,"Restaurant settings","Restoran ayarları")}</h2></div></div>
     <RestaurantForm locale={locale} name={restaurant?.name ?? ""} city={restaurant?.city ?? ""} currency={restaurant?.currency ?? "USD"} fiscalProvider={restaurant?.fiscalProvider ?? null} />
    </article>

    <StaffManager locale={locale} staff={staff} />
   </section>
  </COSTERAAppShell>
 )
}
