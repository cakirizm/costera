export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="COSTERA">
      <svg className="brand-mark" viewBox="0 0 64 64" role="img" aria-hidden="true">
        <path d="M52 14.8 38.8 7.2c-4.4-2.5-9.8-2.5-14.2 0L11.4 14.8A14.2 14.2 0 0 0 4.3 27v10c0 5.1 2.7 9.8 7.1 12.2l13.2 7.6c4.4 2.5 9.8 2.5 14.2 0L52 49.2l-8.2-8.3-9.9 5.7a4.1 4.1 0 0 1-4.1 0L16.6 39a4.1 4.1 0 0 1-2.1-3.6v-6.8c0-1.5.8-2.9 2.1-3.6l13.2-7.6a4.1 4.1 0 0 1 4.1 0l9.9 5.7L52 14.8Z" fill="#0a2740"/>
        <path d="M20 34.5h5.5v11.3L20 42.7v-8.2Zm8.5-8h5.5v24.2a12 12 0 0 1-5.5-1.2v-23Zm8.5-7h5.5v24.1L37 46.8V19.5Z" fill="#b78539"/>
      </svg>
      <div className="brand-copy">
        <span className="brand-name">COSTERA</span>
        {!compact && <span className="brand-tagline">Control costs. Grow profit.</span>}
      </div>
    </div>
  );
}
