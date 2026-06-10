type GutterItemProps = {
  top: string;
  className?: string;
  delay?: string;
  children: React.ReactNode;
};

function GutterItem({ top, className = "", delay, children }: GutterItemProps) {
  return (
    <div
      className={`absolute left-1/2 w-full max-w-[240px] -translate-x-1/2 px-2 text-center ${className}`}
      style={{ top, animationDelay: delay }}
    >
      {children}
    </div>
  );
}

function HandprintSvg({ color, flip, width }: { color: string; flip?: boolean; width: number }) {
  return (
    <svg
      viewBox="0 0 64 72"
      width={width}
      height={width * 1.12}
      aria-hidden
      className="mx-auto playful-hand"
      style={{ color, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M18 28c0-6 4-10 8-10 2 0 4 1 5 3 1-4 4-7 8-7 5 0 9 4 9 10v2c3 1 6 5 6 10 0 7-6 13-14 13H24c-8 0-14-6-14-14 0-5 3-9 8-10v-7z"
        fill="currentColor"
        opacity="0.45"
      />
      <circle cx="14" cy="18" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="22" cy="11" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="31" cy="9" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="40" cy="12" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="47" cy="18" r="4" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function AtomDiagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 90" className={`mx-auto ${className ?? ""}`} aria-hidden>
      <ellipse cx="45" cy="45" rx="36" ry="13" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.7" />
      <ellipse
        cx="45"
        cy="45"
        rx="36"
        ry="13"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1.5"
        opacity="0.7"
        transform="rotate(60 45 45)"
      />
      <ellipse
        cx="45"
        cy="45"
        rx="36"
        ry="13"
        fill="none"
        stroke="#86efac"
        strokeWidth="1.5"
        opacity="0.7"
        transform="rotate(120 45 45)"
      />
      <circle cx="45" cy="45" r="6" fill="#fcd34d" opacity="0.8" />
    </svg>
  );
}

function DnaHelix({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 100" className={`mx-auto ${className ?? ""}`} aria-hidden>
      <path
        d="M8 0 Q20 12 32 0 T32 25 Q20 37 8 25 T8 50 Q20 62 32 50 T32 75 Q20 87 8 75 T8 100"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M32 0 Q20 12 8 0 T8 25 Q20 37 32 25 T32 50 Q20 62 8 50 T8 75 Q20 87 32 75 T32 100"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="2"
        opacity="0.6"
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="10"
          y1={6 + i * 12}
          x2="30"
          y2={6 + i * 12}
          stroke="#86efac"
          strokeWidth="1.5"
          opacity="0.5"
        />
      ))}
    </svg>
  );
}

function GraphAxes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" className={`mx-auto ${className ?? ""}`} aria-hidden>
      <line x1="10" y1="60" x2="70" y2="60" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
      <line x1="10" y1="10" x2="10" y2="60" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
      <path d="M12 55 Q30 20 68 15" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.65" />
    </svg>
  );
}

function Circuit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 50" className={`mx-auto ${className ?? ""}`} aria-hidden>
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

function AnimalSilhouette({
  type,
  className,
}: {
  type: "elephant" | "bird" | "fish" | "turtle";
  className?: string;
}) {
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
    <svg viewBox="0 0 85 70" className={`mx-auto ${className ?? ""}`} aria-hidden>
      <path d={paths[type]} fill={colors[type]} opacity="0.4" />
    </svg>
  );
}

function Beaker({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 55" className={`mx-auto ${className ?? ""}`} aria-hidden>
      <path
        d="M12 8 h16 v6 l8 30 q-2 8 -16 8 q-14 0 -16-8 l8-30 v-6"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        opacity="0.65"
      />
      <path d="M14 38 h12" stroke="#86efac" strokeWidth="2" opacity="0.5" />
      <circle cx="20" cy="42" r="2" fill="#fcd34d" opacity="0.6" />
      <circle cx="16" cy="46" r="1.5" fill="#7dd3fc" opacity="0.6" />
    </svg>
  );
}

function SolarSystem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`mx-auto ${className ?? ""}`} aria-hidden>
      <circle cx="40" cy="40" r="6" fill="#fcd34d" opacity="0.7" />
      <ellipse cx="40" cy="40" rx="22" ry="8" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
      <ellipse cx="40" cy="40" rx="32" ry="12" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
      <circle cx="62" cy="40" r="3" fill="#7dd3fc" opacity="0.6" />
      <circle cx="28" cy="36" r="2" fill="#fca5a5" opacity="0.6" />
    </svg>
  );
}

function PlayfulLabel({
  text,
  subject,
  rotate,
}: {
  text: string;
  subject: "math" | "science" | "chem" | "bio" | "career" | "english";
  rotate?: string;
}) {
  return (
    <span
      className={`playful-float playful-label playful-label-${subject} inline-block select-none text-xs lg:text-sm`}
      style={{ ["--playful-rotate" as string]: rotate ?? "0deg" }}
    >
      {text}
    </span>
  );
}

function LeftGutter() {
  return (
    <>
      <GutterItem top="2%" className="playful-float-slow" delay="0s">
        <HandprintSvg color="#fda4af" width={56} />
      </GutterItem>
      <GutterItem top="9%">
        <PlayfulLabel text="E = mc²" subject="science" rotate="-8deg" />
      </GutterItem>
      <GutterItem top="14%" className="playful-float" delay="1s">
        <HandprintSvg color="#fcd34d" flip width={48} />
      </GutterItem>
      <GutterItem top="20%">
        <PlayfulLabel text="F = ma" subject="science" rotate="4deg" />
      </GutterItem>
      <GutterItem top="26%" className="playful-float-slow" delay="0.5s">
        <AtomDiagram className="playful-spin-slow h-16 w-16 opacity-80" />
      </GutterItem>
      <GutterItem top="34%">
        <PlayfulLabel text="y = mx + c" subject="math" rotate="3deg" />
      </GutterItem>
      <GutterItem top="40%" className="playful-float" delay="1.2s">
        <HandprintSvg color="#86efac" flip width={44} />
      </GutterItem>
      <GutterItem top="46%">
        <PlayfulLabel text="v = u + at" subject="science" rotate="-7deg" />
      </GutterItem>
      <GutterItem top="52%" className="playful-float-slow">
        <GraphAxes className="h-14 w-20 opacity-75" />
      </GutterItem>
      <GutterItem top="58%">
        <PlayfulLabel text="C₆H₁₂O₆" subject="chem" rotate="2deg" />
      </GutterItem>
      <GutterItem top="64%" className="playful-float-slow" delay="0.8s">
        <Circuit className="playful-drift h-10 w-24 opacity-70" />
      </GutterItem>
      <GutterItem top="70%">
        <PlayfulLabel text="mitochondria ⚡" subject="bio" rotate="-2deg" />
      </GutterItem>
      <GutterItem top="76%" className="playful-float">
        <AnimalSilhouette type="elephant" className="h-12 w-14 opacity-75" />
      </GutterItem>
      <GutterItem top="82%">
        <PlayfulLabel text="A B C · read & write" subject="english" rotate="4deg" />
      </GutterItem>
      <GutterItem top="88%" className="playful-float-slow" delay="1.5s">
        <AnimalSilhouette type="fish" className="playful-drift h-10 w-14 opacity-70" />
      </GutterItem>
      <GutterItem top="93%">
        <PlayfulLabel text="½ + ¼ = ¾" subject="math" rotate="-3deg" />
      </GutterItem>
    </>
  );
}

function RightGutter() {
  return (
    <>
      <GutterItem top="2%" className="playful-float" delay="0.3s">
        <HandprintSvg color="#7dd3fc" flip width={52} />
      </GutterItem>
      <GutterItem top="8%">
        <PlayfulLabel text="a² + b² = c²" subject="math" rotate="6deg" />
      </GutterItem>
      <GutterItem top="14%" className="playful-float-slow" delay="1s">
        <Beaker className="h-12 w-10 opacity-75" />
      </GutterItem>
      <GutterItem top="20%">
        <PlayfulLabel text="π ≈ 3.14159" subject="math" rotate="-5deg" />
      </GutterItem>
      <GutterItem top="26%" className="playful-float" delay="0.6s">
        <HandprintSvg color="#c4b5fd" width={50} />
      </GutterItem>
      <GutterItem top="32%" className="playful-float-slow">
        <DnaHelix className="playful-drift h-24 w-10 opacity-80" />
      </GutterItem>
      <GutterItem top="40%">
        <PlayfulLabel text="DNA → RNA → protein" subject="bio" rotate="4deg" />
      </GutterItem>
      <GutterItem top="46%">
        <PlayfulLabel text="2H₂ + O₂ → 2H₂O" subject="chem" rotate="5deg" />
      </GutterItem>
      <GutterItem top="52%" className="playful-spin-slow" delay="2s">
        <AtomDiagram className="h-16 w-16 opacity-70 [animation-direction:reverse]" />
      </GutterItem>
      <GutterItem top="58%">
        <PlayfulLabel text="P = VI" subject="science" rotate="5deg" />
      </GutterItem>
      <GutterItem top="64%" className="playful-float">
        <AnimalSilhouette type="bird" className="h-10 w-14 opacity-75" />
      </GutterItem>
      <GutterItem top="70%">
        <PlayfulLabel text="photosynthesis ☀" subject="bio" rotate="6deg" />
      </GutterItem>
      <GutterItem top="76%" className="playful-float-slow" delay="1.8s">
        <HandprintSvg color="#fdba74" flip width={46} />
      </GutterItem>
      <GutterItem top="82%">
        <PlayfulLabel text="doctor · engineer · teacher" subject="career" rotate="-5deg" />
      </GutterItem>
      <GutterItem top="87%" className="playful-spin-slow">
        <SolarSystem className="h-16 w-16 opacity-65" />
      </GutterItem>
      <GutterItem top="92%" className="playful-float-slow">
        <AnimalSilhouette type="turtle" className="h-10 w-14 opacity-75" />
      </GutterItem>
      <GutterItem top="96%">
        <PlayfulLabel text="scholarships 🎓" subject="career" rotate="3deg" />
      </GutterItem>
      <GutterItem top="4%" className="playful-float-slow hidden xl:block" delay="2.2s">
        <svg className="mx-auto h-12 w-12 opacity-50" viewBox="0 0 60 60" aria-hidden>
          <polygon points="5,55 55,55 5,10" fill="none" stroke="#6366f1" strokeWidth="1.5" />
          <text x="8" y="52" fontSize="7" fill="#6366f1" opacity="0.7">
            90°
          </text>
        </svg>
      </GutterItem>
      <GutterItem top="48%" className="playful-drift hidden xl:block">
        <svg className="mx-auto h-12 w-12 opacity-45" viewBox="0 0 50 50" aria-hidden>
          <circle cx="25" cy="25" r="20" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
          <ellipse cx="25" cy="25" rx="8" ry="20" fill="none" stroke="#22d3ee" strokeWidth="1" />
          <line x1="5" y1="25" x2="45" y2="25" stroke="#22d3ee" strokeWidth="1" />
        </svg>
      </GutterItem>
      <GutterItem top="60%" className="playful-float hidden xl:block">
        <svg className="mx-auto h-14 w-10 opacity-55" viewBox="0 0 40 60" aria-hidden>
          <line x1="20" y1="50" x2="20" y2="20" stroke="#64748b" strokeWidth="2" />
          <circle cx="20" cy="16" r="8" fill="none" stroke="#64748b" strokeWidth="1.5" />
          <line x1="12" y1="50" x2="28" y2="50" stroke="#64748b" strokeWidth="2" />
        </svg>
      </GutterItem>
    </>
  );
}

/** Decorative learning theme — only in side gutters, never over the reading column. */
export function PlayfulBackdrop() {
  return (
    <div className="playful-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="playful-gutter playful-gutter-left">
        <div className="playful-gutter-grid absolute inset-0" />
        <LeftGutter />
      </div>
      <div className="playful-gutter playful-gutter-right">
        <div className="playful-gutter-grid absolute inset-0" />
        <RightGutter />
      </div>
    </div>
  );
}
