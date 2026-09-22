import Link from "next/link";
import { cookies } from "next/headers";
import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { sampleInput } from "@/lib/costera/sample";

export default async function DeliveryPage(){
 const cookieStore = await cookies();
 const demoConnected = cookieStore.get("costera_pos_demo")?.value === "1";

 if (!demoConnected) {
   return (
    <COSTERAAppShell active="/dashboard/delivery" title="Delivery & Channels" eyebrow="NO LIVE SOURCE">
      <div className="costera-metrics five">
        <AppMetric label="Delivery Sales" value="$0" meta="No connected order source" />
        <AppMetric label="Channels Detected" value="0" meta="Waiting for POS or delivery feed" />
        <AppMetric label="Platform Fees" value="—" meta="No fee source" />
        <AppMetric label="Settlements" value="—" meta="No payout source" />
        <AppMetric label="Connector Need" value="Unknown" meta="Check POS coverage first" tone="gold" />
      </div>
      <EmptyWorkspace
        title="No delivery-channel data yet."
        text="Connect a POS first. If the POS already provides channel orders, fees and settlements, COSTERA does not need separate delivery integrations."
      />
    </COSTERAAppShell>
   );
 }

 const channelMap = new Map<string, { sales: number; rows: number; qty: number }>();

 for (const sale of sampleInput.sales) {
   if (sale.channel.toLowerCase() === "dine-in") continue;
   const current = channelMap.get(sale.channel) || { sales: 0, rows: 0, qty: 0 };
   current.sales += sale.netSales || 0;
   current.rows += 1;
   current.qty += sale.quantity;
   channelMap.set(sale.channel, current);
 }

 const rows = [...channelMap.entries()].map(([channel, value]) => ({ channel, ...value }));
 const deliverySales = rows.reduce((sum, row) => sum + row.sales, 0);

 return (
  <COSTERAAppShell active="/dashboard/delivery" title="Delivery & Channels" eyebrow="POS CHANNEL DISCOVERY">
   <div className="costera-metrics five">
    <AppMetric label="Delivery Sales" value={"$" + deliverySales.toLocaleString()} meta="Detected from connected POS" />
    <AppMetric label="Channels Detected" value={String(rows.length)} meta="No fixed vendor list" tone="good" />
    <AppMetric label="Platform Fees" value="Missing" meta="POS demo does not provide fees" tone="bad" />
    <AppMetric label="Settlements" value="Missing" meta="POS demo does not provide payouts" tone="bad" />
    <AppMetric label="Connector Need" value="Partial" meta="Add delivery financial feed only" tone="gold" />
   </div>

   <section className="costera-grid">
    <article className="costera-panel span-2">
     <div className="costera-panel-head">
      <div><span>CHANNEL DISCOVERY</span><h2>Delivery channels found in the POS feed</h2></div>
      <Link href="/dashboard/integrations">Manage sources</Link>
     </div>

     <div className="delivery-generic-table">
      <div className="head">
       <span>Channel</span><span>Sales</span><span>Order rows</span><span>Fees</span><span>Settlement</span><span>Status</span>
      </div>
      {rows.map((row)=><div className="row" key={row.channel}>
       <span><b>{row.channel}</b><small>Provided by POS</small></span>
       <span>{"$" + row.sales.toLocaleString()}</span>
       <span>{row.rows}</span>
       <span className="missing">Not supplied</span>
       <span className="missing">Not supplied</span>
       <span><StatusPill tone="warning">Financial feed needed</StatusPill></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel">
      <div className="costera-panel-head"><div><span>CONNECTOR DECISION</span><h2>Do we need a delivery integration?</h2></div></div>
      <div className="delivery-decision-card">
        <div className="good"><i>✓</i><p><b>Orders already available</b><span>The POS identifies the delivery channel, so COSTERA should not import the same orders twice.</span></p></div>
        <div className="warn"><i>!</i><p><b>Fees are missing</b><span>Connect the delivery platform, aggregator or settlement file only if the POS cannot provide commission deductions.</span></p></div>
        <div className="warn"><i>!</i><p><b>Settlements are missing</b><span>A separate connector is useful for payout reconciliation when this data is not exposed by the POS.</span></p></div>
      </div>
      <Link href="/dashboard/integrations" className="delivery-add-source">Add any delivery source →</Link>
    </article>
   </section>

   <div className="costera-engine-foot">
    Delivery providers are discovered from incoming data; COSTERA does not require a predefined Talabat, Deliveroo, Careem or other vendor list.
   </div>
  </COSTERAAppShell>
 )
}
