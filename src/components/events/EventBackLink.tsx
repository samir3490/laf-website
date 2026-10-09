import Link from "next/link";

type EventBackLinkProps = {
  href?: string;
  label?: string;
};

export default function EventBackLink({
  href = "/events",
  label = "← All events",
}: EventBackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-laf-gold hover:underline mb-6"
    >
      {label.startsWith("←") ? label : `← ${label}`}
    </Link>
  );
}
