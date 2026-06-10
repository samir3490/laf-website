import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200";
  const styles =
    variant === "primary"
      ? "bg-laf-gold text-white hover:bg-laf-gold-bright"
      : "border border-laf-navy text-laf-navy hover:bg-laf-navy hover:text-white";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
