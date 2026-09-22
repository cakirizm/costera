export function Brand({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`} aria-label="COSTERA">
      <svg className="brand-mark" viewBox="0 0 70 70" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="costeraGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D6B070" />
            <stop offset="55%" stopColor="#B98539" />
            <stop offset="100%" stopColor="#8E6128" />
          </linearGradient>
        </defs>
        <path
          d="M56.8 17.4 43.9 9.9a17.7 17.7 0 0 0-17.8 0l-12.9 7.5A17.8 17.8 0 0 0 4.3 32.8v4.4a17.8 17.8 0 0 0 8.9 15.4l12.9 7.5a17.7 17.7 0 0 0 17.8 0l12.9-7.5-9.7-9.4-8.7 5a6.8 6.8 0 0 1-6.8 0l-9.2-5.3a6.8 6.8 0 0 1-3.4-5.9v-3.9c0-2.4 1.3-4.7 3.4-5.9l9.2-5.3a6.8 6.8 0 0 1 6.8 0l8.7 5 9.7-9.5Z"
          fill="currentColor"
        />
        <path d="M24.2 35.2h6.2v14.2l-6.2-3.6V35.2Z" fill="url(#costeraGold)" />
        <path d="M32.8 28.7H39v25.1a13.8 13.8 0 0 1-6.2-1.4V28.7Z" fill="url(#costeraGold)" />
        <path d="M41.4 23.3h6.2v21.8l-6.2 3.6V23.3Z" fill="url(#costeraGold)" />
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
