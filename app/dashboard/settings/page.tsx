import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function SettingsPage(){
 const locale = await getAppLocale();
 return (
  <COSTERAAppShell active="/dashboard/settings" locale={locale} title={tx(locale,"Settings","Ayarlar")}>
   <section className="costera-grid settings-layout">
    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"COST CONTROL","MALİYET KONTROLÜ")}</span><h2>{tx(locale,"Targets","Hedefler")}</h2></div></div>
     <div className="costera-form-stack">
      <label>{tx(locale,"Target Food Cost","Hedef Food Cost")}<input defaultValue="25.0%" /></label>
      <label>{tx(locale,"Variance warning threshold","Fark uyarı eşiği")}<input defaultValue="2.0%" /></label>
      <label>{tx(locale,"Critical threshold","Kritik eşik")}<input defaultValue="5.0%" /></label>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"ORGANIZATION","ORGANİZASYON")}</span><h2>{tx(locale,"Restaurant settings","Restoran ayarları")}</h2></div></div>
     <div className="costera-form-stack">
      <label>{tx(locale,"Group name","Grup adı")}<input defaultValue="Demo Restaurant Group" /></label>
      <label>{tx(locale,"Currency","Para birimi")}<select defaultValue="USD"><option>USD</option><option>AED</option><option>EUR</option></select></label>
      <label>{tx(locale,"Current interface language","Mevcut arayüz dili")}<select value={locale.toUpperCase()} disabled><option>EN</option><option>TR</option></select></label>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"ACCESS","ERİŞİM")}</span><h2>{tx(locale,"Roles","Roller")}</h2></div></div>
     <div className="costera-role-list">
      <span><b>Owner</b><small>{tx(locale,"Full access","Tam erişim")}</small></span>
      <span><b>Operations Manager</b><small>{tx(locale,"Operations + reports","Operasyon + raporlar")}</small></span>
      <span><b>Kitchen Manager</b><small>{tx(locale,"Inventory + recipes","Stok + reçeteler")}</small></span>
      <span><b>Finance</b><small>{tx(locale,"Finance + reports","Finans + raporlar")}</small></span>
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
