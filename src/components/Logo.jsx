export default function Logo({ className = "", markOnly = false }) {
  return (
    <svg
      viewBox={markOnly ? "0 0 48 48" : "0 0 190 48"}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Velora"
    >
      {/* Emblem: a slender curved leaf-like stroke with a small gold jewel accent */}
      <g transform="translate(4, 4)">
        <path
          d="M20 2 C 8 6, 2 16, 6 30 C 9 38, 16 42, 24 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M11 12 C 15 20, 15 28, 10 34"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="24" cy="6" r="2.6" fill="#A9793F" />
      </g>

      {!markOnly && (
        <text
          x="50"
          y="32"
          fontFamily="'Fraunces', Georgia, serif"
          fontStyle="italic"
          fontSize="27"
          fill="currentColor"
          letterSpacing="0.5"
        >
          Velora
        </text>
      )}
    </svg>
  );
}