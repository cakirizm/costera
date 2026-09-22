import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function InventoryPage() {
  const locale = await getAppLocale();
  const rows = [
    [tx(locale,"Minced Beef","Kıyma"),"148 kg","$8.42","$1,246","+17 kg","review"],
    [tx(locale,"Chicken Breast","Tavuk Göğsü"),"201 kg","$5.12","$1,029","+11 kg","review"],
    [tx(locale,"Olive Oil","Zeytinyağı"),"44 L","$13.00","$572","+4 L","review"],
    ["Mozzarella","76 kg","$8.30","$631","+3 kg","normal"],
    [tx(locale,"Tomatoes","Domates"),"94 kg","$2.10","$197","-2 kg","normal"],
  ];

  return (
    <COSTERAAppShell active="/dashboard/inventory" locale={locale} title={tx(locale,"Inventory","Stok")}>
      <div className="costera-metrics five">
        <AppMetric label={tx(locale,"Stock Value","Stok Değeri")} value="$18,420" meta={tx(locale,"+2.4% vs last count","Son sayıma göre +%2.4")} />
        <AppMetric label={tx(locale,"Unexplained Qty","Açıklanamayan Tutar")} value="$1,128" meta={tx(locale,"6.1% of stock value","Stok değerinin %6.1'i")} tone="bad" />
        <AppMetric label={tx(locale,"Critical Items","Kritik Kalemler")} value="4" meta={tx(locale,"Need review today","Bugün incelenmeli")} tone="bad" />
        <AppMetric label={tx(locale,"Low Stock","Düşük Stok")} value="7" meta={tx(locale,"Below configured minimum","Tanımlı minimumun altında")} tone="gold" />
        <AppMetric label={tx(locale,"Last Full Count","Son Tam Sayım")} value="Sep 21" meta={tx(locale,"22:14 · completed","22:14 · tamamlandı")} tone="good" />
      </div>

      <section className="costera-grid inventory-layout">
        <article className="costera-panel span-2">
          <div className="costera-panel-head"><div><span>{tx(locale,"INVENTORY POSITION","STOK DURUMU")}</span><h2>{tx(locale,"Current stock & variance","Mevcut stok & fark")}</h2></div><button>{tx(locale,"Export","Dışa Aktar")}</button></div>
          <div className="costera-table">
            <div className="costera-table-row head"><span>{tx(locale,"Ingredient","Malzeme")}</span><span>{tx(locale,"Qty","Miktar")}</span><span>{tx(locale,"Unit cost","Birim maliyet")}</span><span>{tx(locale,"Value","Değer")}</span><span>{tx(locale,"Variance","Fark")}</span><span>{tx(locale,"Status","Durum")}</span></div>
            {rows.map(r => <div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i} className={i===4 && c.startsWith("+") ? "negative" : ""}>{i===5?<StatusPill tone={c==="review"?"bad":"good"}>{c==="review"?tx(locale,"Review","İncele"):tx(locale,"Normal","Normal")}</StatusPill>:c}</span>)}</div>)}
          </div>
        </article>
        <article className="costera-panel">
          <div className="costera-panel-head"><div><span>{tx(locale,"STOCK HEALTH","STOK SAĞLIĞI")}</span><h2>{tx(locale,"What needs attention","İncelenmesi gerekenler")}</h2></div></div>
          <div className="costera-action-list">
            <div><i className="red">!</i><p><strong>{tx(locale,"Minced Beef","Kıyma")}</strong><span>{tx(locale,"17 kg above theoretical usage","Teorik kullanımın 17 kg üzerinde")}</span></p><b>$561</b></div>
            <div><i className="red">!</i><p><strong>{tx(locale,"Chicken Breast","Tavuk Göğsü")}</strong><span>{tx(locale,"11 kg unexplained","11 kg açıklanamayan fark")}</span></p><b>$176</b></div>
            <div><i className="gold">↓</i><p><strong>Avocado</strong><span>{tx(locale,"Below minimum level","Minimum seviyenin altında")}</span></p><b>6 kg</b></div>
            <div><i className="green">✓</i><p><strong>18 {tx(locale,"items","kalem")}</strong><span>{tx(locale,"Within expected range","Beklenen aralıkta")}</span></p></div>
          </div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
