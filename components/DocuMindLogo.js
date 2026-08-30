"use client";

export function DocuMindSymbol({ className = "w-8 h-8", id = "dm-logo" }) {
  return (
    <svg
      viewBox="0 0 100 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DocuMind Symbol"
    >
      <defs>
        {/* Shield Outer Gradient */}
        <linearGradient id={`${id}-shield-border`} x1="10" y1="10" x2="90" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0D2A5C" />
          <stop offset="40%" stopColor="#071A3D" />
          <stop offset="75%" stopColor="#16B8B0" />
          <stop offset="100%" stopColor="#5EDBD4" />
        </linearGradient>

        {/* Shield Body Gradient */}
        <linearGradient id={`${id}-shield-bg`} x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0D2A5C" />
          <stop offset="100%" stopColor="#05132D" />
        </linearGradient>

        {/* Shield Right Glow */}
        <linearGradient id={`${id}-shield-glow`} x1="70" y1="30" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16B8B0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#5EDBD4" stopOpacity="0.9" />
        </linearGradient>

        {/* Folder Gradient */}
        <linearGradient id={`${id}-folder-grad`} x1="16" y1="50" x2="84" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#19C7BE" />
          <stop offset="100%" stopColor="#0F948F" />
        </linearGradient>

        {/* Shadow */}
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#071A3D" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Shield with Border */}
      <path
        d="M50 4 C68 12 86 18 90 24 C90 66 70 98 50 114 C30 98 10 66 10 24 C14 18 32 12 50 4 Z"
        fill={`url(#${id}-shield-bg)`}
        stroke={`url(#${id}-shield-border)`}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Right Edge Neon Glow Accent */}
      <path
        d="M50 113 C68 98 87 68 87 26"
        stroke={`url(#${id}-shield-glow)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Document Sheet (White) */}
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="M28 24 H60 L72 36 V76 C72 78.2 70.2 80 68 80 H28 C25.8 80 24 78.2 24 76 V28 C24 25.8 25.8 24 28 24 Z"
          fill="#FFFFFF"
        />
        {/* Folded Corner */}
        <path d="M60 24 V36 H72 Z" fill="#DDE5ED" />
        
        {/* Document Text Lines */}
        <rect x="30" y="42" width="22" height="3" rx="1.5" fill="#94A3B8" />
        <rect x="30" y="49" width="34" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="30" y="56" width="26" height="3" rx="1.5" fill="#E2E8F0" />
      </g>

      {/* Folder Pocket with Tab */}
      <path
        d="M18 54 C18 52 19.5 50.5 21.5 50.5 H37 L44 57 H78.5 C80.5 57 82 58.5 82 60.5 V88 C82 92 78 95 74 95 H26 C22 95 18 92 18 88 V54 Z"
        fill={`url(#${id}-folder-grad)`}
      />

      {/* Folder Top Highlight Rim */}
      <path
        d="M21.5 50.5 H37 L44 57 H78.5"
        stroke="#5EDBD4"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Keyhole Cutout in Center */}
      <circle cx="50" cy="73" r="4.2" fill="#FFFFFF" />
      <path d="M47.8 74 L46 83.5 H54 L52.2 74 Z" fill="#FFFFFF" />
    </svg>
  );
}

export default function DocuMindLogo({
  variant = "full", // "full" | "compact" | "symbol"
  size = "md",      // "sm" | "md" | "lg" | "xl"
  withTagline = false,
  className = "",
  id = "dm-logo",
}) {
  const sizeMap = {
    sm: { symbol: "w-6 h-6", text: "text-base", sub: "text-[9px]" },
    md: { symbol: "w-8 h-8", text: "text-xl", sub: "text-[11px]" },
    lg: { symbol: "w-10 h-10", text: "text-2xl", sub: "text-xs" },
    xl: { symbol: "w-14 h-14", text: "text-4xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === "symbol") {
    return <DocuMindSymbol className={`${currentSize.symbol} ${className}`} id={id} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <DocuMindSymbol className={currentSize.symbol} id={id} />
      <div className="flex flex-col justify-center">
        <div className={`font-bold tracking-tight leading-none ${currentSize.text} flex items-center`}>
          <span className="text-[#071A3D]">Docu</span>
          <span className="text-[#16B8B0]">Mind</span>
        </div>
        {withTagline && (
          <span className={`text-[#64748B] font-medium tracking-wide mt-1 ${currentSize.sub}`}>
            Your Documents. Organized. Understood.
          </span>
        )}
      </div>
    </div>
  );
}
