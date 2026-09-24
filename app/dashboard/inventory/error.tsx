"use client";

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="costera-error-page">
      <div className="costera-error-card">
        <h2>Stok yüklenemedi</h2>
        <p>{error.message === "FORBIDDEN" ? "Bu sayfaya erişim yetkiniz yok." : "Beklenmeyen bir hata oluştu."}</p>
        <button type="button" onClick={reset}>Tekrar dene</button>
      </div>
    </div>
  );
}
