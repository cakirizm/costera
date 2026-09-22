import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";

export default function SettingsPage(){
 return (
  <COSTERAAppShell active="/dashboard/settings" title="Settings">
   <section className="costera-grid settings-layout">
    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>COST CONTROL</span><h2>Targets</h2></div></div>
     <div className="costera-form-stack">
      <label>Target Food Cost<input defaultValue="25.0%" /></label>
      <label>Variance warning threshold<input defaultValue="2.0%" /></label>
      <label>Critical threshold<input defaultValue="5.0%" /></label>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>ORGANIZATION</span><h2>Restaurant settings</h2></div></div>
     <div className="costera-form-stack">
      <label>Group name<input defaultValue="Demo Restaurant Group" /></label>
      <label>Currency<select defaultValue="USD"><option>USD</option><option>AED</option><option>EUR</option></select></label>
      <label>Default language<select defaultValue="EN"><option>EN</option><option>TR</option></select></label>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>ACCESS</span><h2>Roles</h2></div></div>
     <div className="costera-role-list">
      <span><b>Owner</b><small>Full access</small></span>
      <span><b>Operations Manager</b><small>Operations + reports</small></span>
      <span><b>Kitchen Manager</b><small>Inventory + recipes</small></span>
      <span><b>Finance</b><small>Finance + reports</small></span>
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
