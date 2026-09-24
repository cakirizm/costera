export default function FinanceLoading() {
  return (
    <div className="costera-loading-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-metrics">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
      <div className="skeleton-panel" />
    </div>
  );
}
