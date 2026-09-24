import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TargetsForm, RestaurantForm } from "@/components/app/SettingsForm";

export default async function SettingsPage(){
 const locale = await getAppLocale();
 const ctx = await requireRole("OWNER");
 const restaurant = ctx.restaurant
   ? await prisma.restaurant.findUnique({ where: { id: ctx.restaurant.id }, select: { name: true, city: true, currency: true, targetFoodCostPct: true } })
   : null;

 return (
  <COSTERAAppShell active="/dashboard/settings" locale={locale} title={tx(locale,"Settings","Ayarlar")}>
   <section className="costera-grid settings-layout">
    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"COST CONTROL","MALİYET KONTROLÜ")}</span><h2>{tx(locale,"Targets","Hedefler")}</h2></div></div>
     <TargetsForm locale={locale} targetFoodCostPct={restaurant?.targetFoodCostPct ?? 25} />
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"ORGANIZATION","ORGANİZASYON")}</span><h2>{tx(locale,"Restaurant settings","Restoran ayarları")}</h2></div></div>
     <RestaurantForm locale={locale} name={restaurant?.name ?? ""} city={restaurant?.city ?? ""} currency={restaurant?.currency ?? "USD"} />
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"ACCESS","ERİŞİM")}</span><h2>{tx(locale,"Roles","Roller")}</h2></div></div>
     <div className="costera-role-list">
      <span><b>{tx(locale, "Owner", "Owner")}</b><small>{tx(locale,"Full access","Tam erişim")}</small></span>
      <span><b>{tx(locale, "Operations Manager", "Operations Manager")}</b><small>{tx(locale,"Operations + reports","Operasyon + raporlar")}</small></span>
      <span><b>{tx(locale, "Kitchen Manager", "Kitchen Manager")}</b><small>{tx(locale,"Inventory + recipes","Stok + reçeteler")}</small></span>
      <span><b>{tx(locale, "Finance", "Finance")}</b><small>{tx(locale,"Finance + reports","Finans + raporlar")}</small></span>
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
