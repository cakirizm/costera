type Locale = "en" | "tr";

const text = {
  en: [
    ["1", "POS & delivery data is collected", "Sales and order activity flows automatically from connected sources.", "POS", "DELIVERY"],
    ["2", "Menu and recipes are matched", "Each sold item is connected to the ingredients and quantities it should consume.", "Chicken 120 g", "Sauce 30 g"],
    ["3", "Stock movement is read", "Purchases, transfers, waste and counts are interpreted in the same operating model.", "Stock In", "Purchase"],
    ["4", "Expected vs. actual is compared", "Recipe-driven usage is compared with what inventory actually consumed.", "$8,420", "$9,680"],
    ["5", "Unexplained variance is isolated", "Known adjustments are removed so the remaining quantity and value can be reviewed.", "$1,260", "+4.1%"],
    ["6", "Management sees the result", "A mobile-ready view shows the cost, stock and recipe areas that need attention.", "$8,320", "28.9%"],
  ],
  tr: [
    ["1", "POS ve delivery verileri toplanır", "Satış ve sipariş hareketleri bağlı kaynaklardan otomatik olarak alınır.", "POS", "DELIVERY"],
    ["2", "Menü ve reçeteler eşleşir", "Satılan her ürün, tüketmesi gereken malzeme ve miktarlarla ilişkilendirilir.", "Tavuk 120 g", "Sos 30 g"],
    ["3", "Stok hareketleri okunur", "Satın alma, transfer, fire ve sayımlar aynı operasyon modelinde anlamlandırılır.", "Stok Girişi", "Satın Alma"],
    ["4", "Teorik ve gerçek karşılaştırılır", "Reçeteye göre beklenen kullanım ile stoğun gerçekten tükettiği miktar karşılaştırılır.", "$8,420", "$9,680"],
    ["5", "Açıklanamayan fark ayrıştırılır", "Bilinen düzeltmeler düşülür; geriye kalan miktar ve değer incelemeye alınır.", "$1,260", "+4.1%"],
    ["6", "Yönetim sonucu net görür", "Mobil uyumlu ekran cost, stok ve reçete tarafında dikkat gerektiren alanları öne çıkarır.", "$8,320", "28.9%"],
  ],
};

export function HowProcess({ locale = "en" }: { locale?: Locale }) {
  const rows = text[locale];
  return (
    <div className="how-six-grid">
      {rows.map(([no, title, copy, value1, value2], i) => (
        <article className="how-step-card" key={no}>
          <span className="how-step-no">{no}</span>
          <div className={`how-step-graphic graphic-${i + 1}`}>
            {i === 0 && <><span>POS</span><span>DELIVERY</span><span>API</span></>}
            {i === 1 && <><div className="graphic-food">◎</div><div><b>{value1}</b><b>{value2}</b><b>{locale === "tr" ? "Parmesan 10 g" : "Parmesan 10 g"}</b></div></>}
            {i === 2 && <><b>{value1}</b><b>{value2}</b><b>{locale === "tr" ? "Fire / Zayi" : "Waste"}</b></>}
            {i === 3 && <><div><small>{locale === "tr" ? "Teorik" : "Expected"}</small><strong>{value1}</strong></div><div><small>{locale === "tr" ? "Gerçek" : "Actual"}</small><strong>{value2}</strong></div></>}
            {i === 4 && <><small>{locale === "tr" ? "Açıklanamayan Fark" : "Unexplained Variance"}</small><strong>{value1}</strong><em>{value2}</em><b>{locale === "tr" ? "Tavuk +18%" : "Chicken +18%"}</b><b>{locale === "tr" ? "Zeytinyağı +22%" : "Olive Oil +22%"}</b></>}
            {i === 5 && <div className="graphic-phone"><small>{locale === "tr" ? "Bugün" : "Today"}</small><strong>{value1}</strong><b>Food Cost {value2}</b></div>}
          </div>
          <h3>{title}</h3>
          <p>{copy}</p>
        </article>
      ))}
    </div>
  );
}
