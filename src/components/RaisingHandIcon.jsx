export default function RaisingHandIcon({ size = 18, color = 'currentColor', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <circle cx="9.5" cy="8" r="4" />
      {/* Body and left shoulder */}
      <path d="M2.5 21a7 7 0 0 1 12-4.5" />
      {/* Raised arm and hand */}
      <path d="M14.5 16.5 17 13V4a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1 1.5 9" />
    </svg>
  );
}
