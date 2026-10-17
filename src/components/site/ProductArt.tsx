import type { Product } from "@/content/products";

/**
 * Tijdelijke illustratie voor producten, tot er echte foto's zijn.
 * Eenvoudige bladvormen op een kleurvlak; vervangen door <img> zodra beeld beschikbaar is.
 */
export function ProductArt({
  art,
  className = "",
  label,
}: {
  art: Product["art"];
  className?: string;
  label?: string;
}) {
  const { bg, fg, variant } = art;
  return (
    <svg
      viewBox="0 0 400 400"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="400" fill={bg} />
      {variant === "leaf" && (
        <g fill={fg}>
          <path d="M200 340 C120 280 110 160 200 70 C290 160 280 280 200 340 Z" />
          <path d="M200 340 L200 110" stroke={bg} strokeWidth="6" fill="none" />
        </g>
      )}
      {variant === "leaves" && (
        <g fill={fg}>
          <path d="M120 320 C50 270 50 170 130 110 C190 170 180 270 120 320 Z" opacity="0.9" />
          <path d="M270 330 C200 280 205 170 285 100 C345 170 335 280 270 330 Z" />
        </g>
      )}
      {variant === "sprig" && (
        <g fill={fg} stroke={fg}>
          <path d="M200 350 L200 80" strokeWidth="6" fill="none" />
          {[130, 190, 250].map((y) => (
            <g key={y}>
              <ellipse cx="150" cy={y} rx="46" ry="20" transform={`rotate(-30 150 ${y})`} />
              <ellipse
                cx="250"
                cy={y - 24}
                rx="46"
                ry="20"
                transform={`rotate(30 250 ${y - 24})`}
              />
            </g>
          ))}
        </g>
      )}
      {variant === "grain" && (
        <g fill={fg}>
          {Array.from({ length: 60 }).map((_, i) => (
            <circle
              key={i}
              cx={50 + ((i * 53) % 300)}
              cy={60 + ((i * 97) % 280)}
              r={3 + (i % 4)}
              opacity={0.35 + (i % 5) * 0.12}
            />
          ))}
        </g>
      )}
      {variant === "drop" && (
        <g fill={fg}>
          <path d="M200 70 C260 150 290 200 290 245 A90 90 0 0 1 110 245 C110 200 140 150 200 70 Z" />
        </g>
      )}
    </svg>
  );
}
