const COSTERA_LOGO = "data:image/webp;base64,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";

export function Brand({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`} aria-label="COSTERA">
      <img
        className="brand-approved-image"
        src={COSTERA_LOGO}
        alt="COSTERA"
        width="230"
        height="55"
      />
      {!compact && (
        <>
          <span className="brand-divider" />
          <span className="brand-tagline">Control costs. Grow profit.</span>
        </>
      )}
    </div>
  );
}
