import Link from "next/link";

export function EmptyWorkspace({
  title = "No live data connected yet.",
  text = "Connect a POS source or start the Polaris demo connector to populate this workspace.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="costera-empty-workspace">
      <div className="costera-empty-icon">⌁</div>
      <span>DATA SOURCE REQUIRED</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <div>
        <Link href="/dashboard/integrations">Open Integrations</Link>
        <Link href="/dashboard/import" className="secondary">Upload files instead</Link>
      </div>
    </section>
  );
}
