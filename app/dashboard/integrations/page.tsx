import { COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

const integrations = [
 ["POS","Generic POS / API","Connected","2 min ago"],
 ["Inventory","CSV + API","Connected","8 min ago"],
 ["Talabat","Orders & settlements","Connected","4 min ago"],
 ["Deliveroo","Orders & settlements","Connected","6 min ago"],
 ["Careem","Orders & settlements","Connected","5 min ago"],
 ["Accounting","Manual / CSV","Setup","—"],
];

export default function IntegrationsPage(){
 return (
  <COSTERAAppShell active="/dashboard/integrations" title="Integrations">
   <div className="costera-integration-banner">
    <div><i/>5 connections healthy</div>
    <p>All critical sales and operational data sources are syncing normally.</p>
    <button>Run health check</button>
   </div>
   <section className="costera-grid">
    <article className="costera-panel span-3">
     <div className="costera-panel-head"><div><span>DATA SOURCES</span><h2>Connections & sync health</h2></div><button>+ Add integration</button></div>
     <div className="costera-integration-grid">
      {integrations.map(r=><div className="costera-integration-card" key={r[0]}>
       <div className="costera-integration-icon">{r[0].slice(0,2).toUpperCase()}</div>
       <div><h3>{r[0]}</h3><p>{r[1]}</p><small>Last sync: {r[3]}</small></div>
       <StatusPill tone={r[2]==="Connected"?"good":"warning"}>{r[2]}</StatusPill>
      </div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
