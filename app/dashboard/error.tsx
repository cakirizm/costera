"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="costera-error-page">
      <div className="costera-error-card">
        <h2>Bir şeyler ters gitti</h2>
        <p>{error.message === "FORBIDDEN" ? "Bu sayfaya erişim yetkiniz yok." : "Beklenmeyen bir hata oluştu."}</p>
        <button onClick={reset}>Tekrar dene</button>
      </div>
    </div>
  );
}
