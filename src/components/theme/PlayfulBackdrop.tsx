const DOODLES = [
  { label: "E = mc²", style: { top: "8%", left: "4%", rotate: "-12deg", color: "#38bdf8" } },
  { label: "H₂O", style: { top: "14%", right: "6%", rotate: "8deg", color: "#4ade80" } },
  { label: "F = ma", style: { top: "32%", left: "2%", rotate: "6deg", color: "#f472b6" } },
  { label: "a² + b² = c²", style: { top: "48%", right: "3%", rotate: "-6deg", color: "#facc15" } },
  { label: "π ≈ 3.14", style: { bottom: "28%", left: "5%", rotate: "-8deg", color: "#fb923c" } },
  { label: "6CO₂ + 6H₂O", style: { bottom: "18%", right: "5%", rotate: "10deg", color: "#4ade80" } },
  { label: "🐘", style: { top: "22%", left: "12%", rotate: "4deg", color: "#94a3b8" } },
  { label: "🦋", style: { top: "55%", right: "12%", rotate: "-4deg", color: "#c084fc" } },
  { label: "📚", style: { bottom: "35%", left: "10%", rotate: "12deg", color: "#f97316" } },
  { label: "🔬", style: { bottom: "12%", left: "18%", rotate: "-10deg", color: "#38bdf8" } },
  { label: "✏️", style: { top: "38%", right: "14%", rotate: "15deg", color: "#facc15" } },
  { label: "🌍", style: { top: "68%", left: "3%", rotate: "-5deg", color: "#22d3ee" } },
];

function Handprint({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 72"
      className={className}
      aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M18 28c0-6 4-10 8-10 2 0 4 1 5 3 1-4 4-7 8-7 5 0 9 4 9 10v2c3 1 6 5 6 10 0 7-6 13-14 13H24c-8 0-14-6-14-14 0-5 3-9 8-10v-7z"
        fill="currentColor"
        opacity="0.35"
      />
      <circle cx="14" cy="18" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="22" cy="12" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="31" cy="10" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="40" cy="13" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="47" cy="19" r="3.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function Atom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <ellipse cx="40" cy="40" rx="32" ry="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <ellipse
        cx="40"
        cy="40"
        rx="32"
        ry="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.4"
        transform="rotate(60 40 40)"
      />
      <ellipse
        cx="40"
        cy="40"
        rx="32"
        ry="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.4"
        transform="rotate(120 40 40)"
      />
      <circle cx="40" cy="40" r="5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function PlayfulBackdrop() {
  return (
    <div
      className="playful-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="playful-backdrop-grid absolute inset-0" />

      <Handprint className="playful-float playful-hand absolute top-[10%] right-[8%] h-16 w-16 text-sky-400" />
      <Handprint
        className="playful-float-slow playful-hand absolute bottom-[20%] left-[6%] h-20 w-20 text-amber-400"
        flip
      />
      <Handprint className="playful-float playful-hand absolute top-[45%] left-[4%] h-14 w-14 text-emerald-400" flip />

      <Atom className="playful-spin-slow absolute top-[18%] left-[20%] h-20 w-20 text-violet-400" />
      <Atom className="playful-spin-slow absolute bottom-[25%] right-[18%] h-24 w-24 text-sky-400 [animation-direction:reverse]" />

      {DOODLES.map((d, i) => (
        <span
          key={d.label}
          className="playful-float absolute hidden select-none font-semibold text-sm md:inline-block playful-doodle"
          style={{
            ...d.style,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {d.label}
        </span>
      ))}

      <svg className="absolute bottom-[8%] right-[10%] h-24 w-24 playful-float-slow text-orange-400 opacity-40" viewBox="0 0 100 100" aria-hidden>
        <path d="M20 70 Q35 30 50 50 T80 35" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <polygon points="80,35 72,42 78,48" fill="currentColor" />
        <text x="8" y="92" fill="currentColor" fontSize="11" fontFamily="Georgia, serif">light →</text>
      </svg>
    </div>
  );
}
