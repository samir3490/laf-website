type Doodle = {
  text: string;
  className: string;
  style: { top?: string; bottom?: string; left?: string; right?: string; "--r"?: string };
};

const HANDPRINTS: {
  color: string;
  style: { top?: string; bottom?: string; left?: string; right?: string; width: number };
  flip?: boolean;
  delay: string;
}[] = [
  { color: "#fda4af", style: { top: "6%", left: "2%", width: 72 }, delay: "0s" },
  { color: "#fcd34d", style: { top: "12%", right: "3%", width: 64 }, flip: true, delay: "1s" },
  { color: "#86efac", style: { top: "38%", left: "1%", width: 56 }, delay: "2s" },
  { color: "#7dd3fc", style: { bottom: "30%", right: "2%", width: 68 }, flip: true, delay: "0.5s" },
  { color: "#c4b5fd", style: { bottom: "8%", left: "4%", width: 80 }, delay: "1.5s" },
  { color: "#fdba74", style: { top: "58%", right: "1%", width: 52 }, delay: "2.5s" },
  { color: "#f9a8d4", style: { top: "24%", left: "8%", width: 48 }, flip: true, delay: "3s" },
  { color: "#a7f3d0", style: { bottom: "45%", left: "3%", width: 60 }, delay: "1.2s" },
];

const LABELS: Doodle[] = [
  { text: "E = mc²", className: "soft-label soft-label-science", style: { top: "5%", left: "14%", "--r": "-8deg" } },
  { text: "a² + b² = c²", className: "soft-label soft-label-math", style: { top: "8%", right: "12%", "--r": "6deg" } },
  { text: "F = ma", className: "soft-label soft-label-science", style: { top: "20%", left: "3%", "--r": "4deg" } },
  { text: "π ≈ 3.14159", className: "soft-label soft-label-math", style: { top: "28%", right: "6%", "--r": "-5deg" } },
  { text: "y = mx + c", className: "soft-label soft-label-math", style: { top: "42%", left: "5%", "--r": "3deg" } },
  { text: "∫ f(x) dx", className: "soft-label soft-label-math", style: { bottom: "38%", right: "8%", "--r": "-4deg" } },
  { text: "2H₂ + O₂ → 2H₂O", className: "soft-label soft-label-chem", style: { top: "52%", right: "4%", "--r": "5deg" } },
  { text: "NaCl · H₂O", className: "soft-label soft-label-chem", style: { bottom: "52%", left: "7%", "--r": "-6deg" } },
  { text: "C₆H₁₂O₆", className: "soft-label soft-label-chem", style: { top: "65%", left: "2%", "--r": "2deg" } },
  { text: "pH 7 · neutral", className: "soft-label soft-label-chem", style: { bottom: "22%", right: "10%", "--r": "-3deg" } },
  { text: "DNA → RNA → protein", className: "soft-label soft-label-bio", style: { top: "35%", right: "2%", "--r": "4deg" } },
  { text: "mitochondria ⚡", className: "soft-label soft-label-bio", style: { bottom: "62%", left: "10%", "--r": "-2deg" } },
  { text: "photosynthesis ☀", className: "soft-label soft-label-bio", style: { top: "72%", right: "14%", "--r": "6deg" } },
  { text: "doctor · engineer · teacher", className: "soft-label soft-label-career", style: { bottom: "12%", left: "12%", "--r": "-5deg" } },
  { text: "scholarships 🎓", className: "soft-label soft-label-career", style: { top: "15%", left: "22%", "--r": "3deg" } },
  { text: "A B C · read & write", className: "soft-label soft-label-english", style: { bottom: "28%", left: "2%", "--r": "4deg" } },
  { text: "v = u + at", className: "soft-label soft-label-science", style: { top: "48%", left: "12%", "--r": "-7deg" } },
  { text: "P = VI", className: "soft-label soft-label-science", style: { bottom: "48%", right: "3%", "--r": "5deg" } },
];

function HandprintSvg({ color, flip, width }: { color: string; flip?: boolean; width: number }) {
  return (
    <svg
      viewBox="0 0 64 72"
      width={width}
      height={width * 1.12}
      aria-hidden
      style={{ color, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M18 28c0-6 4-10 8-10 2 0 4 1 5 3 1-4 4-7 8-7 5 0 9 4 9 10v2c3 1 6 5 6 10 0 7-6 13-14 13H24c-8 0-14-6-14-14 0-5 3-9 8-10v-7z"
        fill="currentColor"
        opacity="0.55"
      />
      <circle cx="14" cy="18" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="11" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="31" cy="9" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="40" cy="12" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="47" cy="18" r="4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function AtomDiagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 90" className={className} aria-hidden>
      <ellipse cx="45" cy="45" rx="36" ry="13" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.7" />
      <ellipse cx="45" cy="45" rx="36" ry="13" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7" transform="rotate(60 45 45)" />
      <ellipse cx="45" cy="45" rx="36" ry="13" fill="none" stroke="#86efac" strokeWidth="1.5" opacity="0.7" transform="rotate(120 45 45)" />
      <circle cx="45" cy="45" r="6" fill="#fcd34d" opacity="0.8" />
    </svg>
  );
}

function DnaHelix({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 100" className={className} aria-hidden>
      <path d="M8 0 Q20 12 32 0 T32 25 Q20 37 8 25 T8 50 Q20 62 32 50 T32 75 Q20 87 8 75 T8 100" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.6" />
      <path d="M32 0 Q20 12 8 0 T8 25 Q20 37 32 25 T32 50 Q20 62 8 50 T8 75 Q20 87 32 75 T32 100" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1="10" y1={6 + i * 12} x2="30" y2={6 + i * 12} stroke="#86efac" strokeWidth="1.5" opacity="0.5" />
      ))}
    </svg>
  );
}

function GraphAxes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" className={className} aria-hidden>
      <line x1="10" y1="60" x2="70" y2="60" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
      <line x1="10" y1="10" x2="10" y2="60" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
      <path d="M12 55 Q30 20 68 15" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.65" />
    </svg>
  );
}

function Circuit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 50" className={className} aria-hidden>
      <rect x="5" y="15" width="20" height="20" rx="2" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
      <text x="10" y="29" fontSize="8" fill="#d97706" opacity="0.8">
        V
      </text>
      <line x1="25" y1="25" x2="40" y2="25" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
      <circle cx="55" cy="25" r="8" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
      <line x1="63" y1="25" x2="78" y2="25" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
      <path d="M40 25 h5 l3-6 3 12 3-8 3 6 h5" fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function AnimalSilhouette({ type, className }: { type: "elephant" | "bird" | "fish" | "turtle"; className?: string }) {
  const paths = {
    elephant:
      "M8 35 Q5 25 15 20 Q25 12 40 18 Q55 10 70 22 Q78 30 75 40 Q72 48 60 45 L55 55 Q50 62 42 58 Q35 52 30 45 Q20 48 12 42 Z",
    bird: "M10 40 Q25 15 45 30 Q60 20 75 35 Q55 38 40 50 Q25 55 10 40 Z",
    fish: "M10 35 Q30 15 60 30 Q75 35 70 40 Q75 45 60 50 Q30 55 10 35 M65 35 L78 30 L78 50 L65 45",
    turtle:
      "M20 38 Q35 22 55 30 Q70 35 65 45 Q55 55 35 52 Q20 48 20 38 M30 50 L25 62 M40 52 L40 65 M50 50 L55 63 M58 48 L68 58",
  };
  const colors = { elephant: "#94a3b8", bird: "#60a5fa", fish: "#38bdf8", turtle: "#4ade80" };
  return (
    <svg viewBox="0 0 85 70" className={className} aria-hidden>
      <path d={paths[type]} fill={colors[type]} opacity="0.35" />
    </svg>
  );
}

function Beaker({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 55" className={className} aria-hidden>
      <path d="M12 8 h16 v6 l8 30 q-2 8 -16 8 q-14 0 -16-8 l8-30 v-6" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.65" />
      <path d="M14 38 h12" stroke="#86efac" strokeWidth="2" opacity="0.5" />
      <circle cx="20" cy="42" r="2" fill="#fcd34d" opacity="0.6" />
      <circle cx="16" cy="46" r="1.5" fill="#7dd3fc" opacity="0.6" />
    </svg>
  );
}

function SolarSystem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <circle cx="40" cy="40" r="6" fill="#fcd34d" opacity="0.7" />
      <ellipse cx="40" cy="40" rx="22" ry="8" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
      <ellipse cx="40" cy="40" rx="32" ry="12" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
      <circle cx="62" cy="40" r="3" fill="#7dd3fc" opacity="0.6" />
      <circle cx="28" cy="36" r="2" fill="#fca5a5" opacity="0.6" />
    </svg>
  );
}

export function PlayfulBackdropSoft() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {HANDPRINTS.map((h, i) => (
        <div
          key={i}
          className="absolute soft-float soft-pulse"
          style={{ ...h.style, animationDelay: h.delay }}
        >
          <HandprintSvg color={h.color} flip={h.flip} width={h.style.width as number} />
        </div>
      ))}

      {LABELS.map((d, i) => (
        <span
          key={d.text}
          className={`absolute hidden md:inline-block soft-float soft-label ${d.className}`}
          style={{ ...d.style, animationDelay: `${i * 0.45}s` }}
        >
          {d.text}
        </span>
      ))}

      <AtomDiagram className="soft-spin absolute top-[16%] left-[18%] h-24 w-24 opacity-80" />
      <AtomDiagram className="soft-spin absolute bottom-[20%] right-[16%] h-28 w-28 opacity-70 [animation-direction:reverse]" />
      <DnaHelix className="soft-drift absolute top-[30%] right-[5%] h-28 w-11 opacity-80" />
      <GraphAxes className="soft-float absolute bottom-[35%] left-[6%] h-16 w-20 opacity-75" />
      <Circuit className="soft-drift absolute top-[55%] left-[14%] h-12 w-24 opacity-70" />
      <Beaker className="soft-float absolute top-[10%] right-[20%] h-14 w-10 opacity-75" />
      <SolarSystem className="soft-spin absolute bottom-[10%] right-[8%] h-20 w-20 opacity-65" />

      <AnimalSilhouette type="elephant" className="soft-drift absolute top-[44%] right-[12%] h-14 w-16 opacity-80" />
      <AnimalSilhouette type="bird" className="soft-float absolute top-[18%] left-[32%] h-10 w-14 opacity-75" />
      <AnimalSilhouette type="fish" className="soft-drift absolute bottom-[40%] left-[20%] h-10 w-14 opacity-70" />
      <AnimalSilhouette type="turtle" className="soft-float absolute bottom-[15%] left-[28%] h-11 w-14 opacity-75" />

      {/* Triangle ruler — geometry */}
      <svg className="soft-float absolute top-[62%] right-[22%] h-16 w-16 opacity-50" viewBox="0 0 60 60" aria-hidden>
        <polygon points="5,55 55,55 5,10" fill="none" stroke="#6366f1" strokeWidth="1.5" />
        <text x="8" y="52" fontSize="7" fill="#6366f1" opacity="0.7">
          90°
        </text>
      </svg>

      {/* Globe */}
      <svg className="soft-spin absolute top-[8%] left-[42%] h-14 w-14 opacity-45" viewBox="0 0 50 50" aria-hidden>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        <ellipse cx="25" cy="25" rx="8" ry="20" fill="none" stroke="#22d3ee" strokeWidth="1" />
        <line x1="5" y1="25" x2="45" y2="25" stroke="#22d3ee" strokeWidth="1" />
      </svg>

      {/* Microscope */}
      <svg className="soft-drift absolute bottom-[55%] right-[4%] h-16 w-12 opacity-55" viewBox="0 0 40 60" aria-hidden>
        <line x1="20" y1="50" x2="20" y2="20" stroke="#64748b" strokeWidth="2" />
        <circle cx="20" cy="16" r="8" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <line x1="12" y1="50" x2="28" y2="50" stroke="#64748b" strokeWidth="2" />
      </svg>

      {/* Fraction */}
      <span
        className="soft-label soft-label-math absolute hidden lg:inline soft-pulse"
        style={{ top: "78%", left: "8%", animationDelay: "2s" }}
      >
        ½ + ¼ = ¾
      </span>
    </div>
  );
}
