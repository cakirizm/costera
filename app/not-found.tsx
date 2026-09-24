import Link from "next/link";

export default function NotFound() {
  return (
    <div className="costera-error-page">
      <div className="costera-error-card">
        <h2>404</h2>
        <p>Aradığınız sayfa bulunamadı.</p>
        <Link href="/">Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
