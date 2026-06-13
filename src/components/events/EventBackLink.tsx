import Link from "next/link";

export default function EventBackLink() {
  return (
    <Link
      href="/events"
      className="inline-flex items-center gap-1 text-sm font-medium text-laf-gold hover:underline mb-6"
    >
      ← All events
    </Link>
  );
}
