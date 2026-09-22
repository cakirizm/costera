export function Brand({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`} aria-label="COSTERA">
      <svg className="brand-mark" viewBox="0 0 72 72" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="costeraNavyTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0A2238" />
            <stop offset="55%" stopColor="#102E48" />
            <stop offset="100%" stopColor="#183E5D" />
          </linearGradient>
          <linearGradient id="costeraNavyBottom" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#061C2E" />
            <stop offset="100%" stopColor="#1A5277" />
          </linearGradient>
          <linearGradient id="costeraGoldBar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E3BB73" />
            <stop offset="48%" stopColor="#C38A34" />
            <stop offset="100%" stopColor="#8A5A1E" />
          </linearGradient>
        </defs>

        <path
          d="M11 26.4c0-4.8 2.5-9.2 6.6-11.7L35.2 4.2c4.2-2.5 9.5-2.6 13.8-.2l12 6.8-11.4 7.3c-2.5 1.6-5.7 1.6-8.2.1l-5.6-3.4a7 7 0 0 0-7.2 0L11 25.7v.7Z"
          fill="url(#costeraNavyTop)"
        />
        <path
          d="M10.9 45.4c.6 4.4 3.1 8.2 6.9 10.4l17.6 10.4c4.2 2.5 9.5 2.5 13.8.1l11.9-6.9-11.5-7.2c-2.5-1.6-5.7-1.6-8.2-.1l-5.5 3.3a7 7 0 0 1-7.2 0L10.9 44.7v.7Z"
          fill="url(#costeraNavyBottom)"
        />

        <path d="M18 35.7 25.2 31v19.6c-4.4-2.1-7.2-5.4-7.2-10.2v-4.7Z" fill="url(#costeraGoldBar)" />
        <path d="M28.7 29.1 36 24.5v29.7c-2.4.5-4.9.2-7.3-.9V29.1Z" fill="url(#costeraGoldBar)" />
        <path d="M39.4 22.5 46.8 18v31.1l-7.4 4.4v-31Z" fill="url(#costeraGoldBar)" />
      </svg>

      <div className="brand-lockup">
        <span className="brand-name">COSTERA</span>
        {!compact && (
          <>
            <span className="brand-divider" />
            <span className="brand-tagline">Control costs. Grow profit.</span>
          </>
        )}
      </div>
    </div>
  );
}
