import Link from "next/link";
import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function DeliveryPage(){
 const locale = await getAppLocale();
 const ctx = await getSessionContext();
 const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;

 if (!input) {
   return (
    <COSTERAAppShell active="/dashboard/delivery" locale={locale} title={tx(locale,"Delivery & Channels","Delivery & Kanallar")} eyebrow={tx(locale,"NO LIVE SOURCE","CANLI VERİ KAYNAĞI YOK")}>
      <div className="costera-metrics five">
        <AppMetric label={tx(locale,"Delivery Sales","Delivery Satışları")} value="$0" meta={tx(locale,"No connected order source","Bağlı sipariş kaynağı yok")} />
        <AppMetric label={tx(locale,"Channels Detected","Bulunan Kanallar")} value="0" meta={tx(locale,"Waiting for POS or delivery feed","POS veya delivery akışı bekleniyor")} />
        <AppMetric label={tx(locale,"Platform Fees","Platform Ücretleri")} value="—" meta={tx(locale,"No fee source","Ücret kaynağı yok")} />
        <AppMetric label={tx(locale,"Settlements","Settlement")} value="—" meta={tx(locale,"No payout source","Ödeme kaynağı yok")} />
        <AppMetric label={tx(locale,"Connector Need","Connector İhtiyacı")} value={tx(locale,"Unknown","Bilinmiyor")} meta={tx(locale,"Check POS coverage first","Önce POS kapsamını kontrol et")} tone="gold" />
      </div>
      <EmptyWorkspace
        locale={locale}
        title={tx(locale,"No delivery-channel data yet.","Henüz delivery kanal verisi yok.")}
        text={tx(locale,"Connect a POS first. If the POS already provides channel orders, fees and settlements, COSTERA does not need separate delivery integrations.","Önce POS bağlayın. POS kanal siparişleri, ücretler ve settlement verisini zaten sağlıyorsa COSTERA'nın ayrı delivery entegrasyonuna ihtiyacı yoktur.")}
      />
    </COSTERAAppShell>
   );
 }

 const priceById = new Map(input.menuItems.map((m) => [m.id, m.sellingPrice]));
 const channelMap = new Map<string, { sales: number; rows: number; qty: number }>();
 for (const sale of input.sales) {
   if (sale.channel.toLowerCase() === "dine-in") continue;
   const current = channelMap.get(sale.channel) || { sales: 0, rows: 0, qty: 0 };
   current.sales += sale.netSales ?? sale.quantity * (priceById.get(sale.menuItemId) || 0);
   current.rows += 1;
   current.qty += sale.quantity;
   channelMap.set(sale.channel, current);
 }
 const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
 const rows = [...channelMap.entries()].map(([channel, value]) => ({ channel, ...value }));
 const deliverySales = rows.reduce((sum, row) => sum + row.sales, 0);

 return (
  <COSTERAAppShell active="/dashboard/delivery" locale={locale} title={tx(locale,"Delivery & Channels","Delivery & Kanallar")} eyebrow={tx(locale,"POS CHANNEL DISCOVERY","POS KANAL KEŞFİ")}>
   <div className="costera-metrics five">
    <AppMetric label={tx(locale,"Delivery Sales","Delivery Satışları")} value={money(deliverySales)} meta={tx(locale,"Detected from connected POS","Bağlı POS'tan bulundu")} />
    <AppMetric label={tx(locale,"Channels Detected","Bulunan Kanallar")} value={String(rows.length)} meta={tx(locale,"No fixed vendor list","Sabit firma listesi yok")} tone="good" />
    <AppMetric label={tx(locale,"Platform Fees","Platform Ücretleri")} value={tx(locale,"Missing","Eksik")} meta={tx(locale,"POS demo does not provide fees","POS demo ücret verisi sağlamıyor")} tone="bad" />
    <AppMetric label={tx(locale,"Settlements","Settlement")} value={tx(locale,"Missing","Eksik")} meta={tx(locale,"POS demo does not provide payouts","POS demo ödeme verisi sağlamıyor")} tone="bad" />
    <AppMetric label={tx(locale,"Connector Need","Connector İhtiyacı")} value={tx(locale,"Partial","Kısmi")} meta={tx(locale,"Add delivery financial feed only","Sadece delivery finansal akışını ekle")} tone="gold" />
   </div>

   <section className="costera-grid">
    <article className="costera-panel span-2">
     <div className="costera-panel-head">
      <div><span>{tx(locale,"CHANNEL DISCOVERY","KANAL KEŞFİ")}</span><h2>{tx(locale,"Delivery channels found in the POS feed","POS akışında bulunan delivery kanalları")}</h2></div>
      <Link href="/dashboard/integrations">{tx(locale,"Manage sources","Kaynakları yönet")}</Link>
     </div>

     <div className="delivery-generic-table">
      <div className="head"><span>{tx(locale,"Channel","Kanal")}</span><span>{tx(locale,"Sales","Satış")}</span><span>{tx(locale,"Order rows","Sipariş satırları")}</span><span>{tx(locale,"Fees","Ücretler")}</span><span>Settlement</span><span>{tx(locale,"Status","Durum")}</span></div>
      {rows.map((row)=><div className="row" key={row.channel}>
       <span><b>{row.channel}</b><small>{tx(locale,"Provided by POS","POS tarafından sağlandı")}</small></span>
       <span>{money(row.sales)}</span>
       <span>{row.rows}</span>
       <span className="missing">{tx(locale,"Not supplied","Sağlanmadı")}</span>
       <span className="missing">{tx(locale,"Not supplied","Sağlanmadı")}</span>
       <span><StatusPill tone="warning">{tx(locale,"Financial feed needed","Finansal akış gerekli")}</StatusPill></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel">
      <div className="costera-panel-head"><div><span>{tx(locale,"CONNECTOR DECISION","CONNECTOR KARARI")}</span><h2>{tx(locale,"Do we need a delivery integration?","Delivery entegrasyonu gerekiyor mu?")}</h2></div></div>
      <div className="delivery-decision-card">
        <div className="good"><i>✓</i><p><b>{tx(locale,"Orders already available","Siparişler zaten mevcut")}</b><span>{tx(locale,"The POS identifies the delivery channel, so COSTERA should not import the same orders twice.","POS delivery kanalını tanıyor; COSTERA aynı siparişleri ikinci kez içeri almamalı.")}</span></p></div>
        <div className="warn"><i>!</i><p><b>{tx(locale,"Fees are missing","Ücretler eksik")}</b><span>{tx(locale,"Connect the delivery platform, aggregator or settlement file only if the POS cannot provide commission deductions.","POS komisyon kesintilerini veremiyorsa sadece delivery platformu, aggregator veya settlement dosyasını bağlayın.")}</span></p></div>
        <div className="warn"><i>!</i><p><b>{tx(locale,"Settlements are missing","Settlement verisi eksik")}</b><span>{tx(locale,"A separate connector is useful for payout reconciliation when this data is not exposed by the POS.","POS bu veriyi sağlamıyorsa payout mutabakatı için ayrı connector faydalıdır.")}</span></p></div>
      </div>
      <Link href="/dashboard/integrations" className="delivery-add-source">{tx(locale,"Add any delivery source","Herhangi bir delivery kaynağı ekle")} →</Link>
    </article>
   </section>

   <div className="costera-engine-foot">{tx(locale,"Delivery providers are discovered from incoming data; COSTERA does not require a predefined Talabat, Deliveroo, Careem or other vendor list.","Delivery sağlayıcıları gelen veriden otomatik keşfedilir; COSTERA Talabat, Deliveroo, Careem veya başka bir firma için önceden tanımlı sabit liste gerektirmez.")}</div>
  </COSTERAAppShell>
 )
}
