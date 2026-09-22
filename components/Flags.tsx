export function TurkeyFlag({ className = "language-flag" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" rx="2" fill="#E30A17" />
      <circle cx="12" cy="10" r="5.2" fill="#fff" />
      <circle cx="13.8" cy="10" r="4.15" fill="#E30A17" />
      <path d="m18.2 10 1.45.47-.9-1.23v1.52l.9-1.23-1.45.47.9 1.23V9.71l-.9 1.23Z" fill="#fff" />
    </svg>
  );
}

export function UKFlag({ className = "language-flag" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" rx="2" fill="#012169" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" strokeWidth="1.8" />
      <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.2" />
    </svg>
  );
}
