export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
