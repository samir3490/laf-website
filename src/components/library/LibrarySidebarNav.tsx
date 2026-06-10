import Link from "next/link";
import { getLearningPaths } from "@/lib/library-paths";

const MODULE_LINKS = [
  { href: "/library", label: "All resources" },
  { href: "/library/robotics", label: "Robotics" },
  { href: "/library/scholarships", label: "Scholarships" },
  { href: "/library/volunteer-training", label: "Volunteer training" },
  { href: "/library/ngo", label: "NGO knowledge" },
  { href: "/library/paths", label: "Learning paths" },
  { href: "/library/submit", label: "Suggest a site" },
];

export default function LibrarySidebarNav() {
  const paths = getLearningPaths();

  return (
    <nav className="space-y-6" aria-label="Library navigation">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold mb-3">
          Browse
        </p>
        <ul className="space-y-1">
          {MODULE_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block text-sm text-laf-navy hover:text-laf-gold py-1"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold mb-3">
          Learning paths
        </p>
        <ul className="space-y-1">
          {paths.map((path) => (
            <li key={path.id}>
              <Link
                href={`/library/paths/${path.id}`}
                className="block text-sm text-laf-muted hover:text-laf-gold py-1 leading-snug"
              >
                {path.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
