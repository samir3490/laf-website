type FaqLink = { label: string; href: string };

export type FaqItem = {
  question: string;
  answer: string;
  bullets?: string[];
  after?: string;
  links?: FaqLink[];
};

function flattenAnswer(item: FaqItem): string {
  const parts = [item.answer];
  if (item.bullets?.length) {
    parts.push(item.bullets.map((b) => `• ${b}`).join("\n"));
  }
  if (item.after) parts.push(item.after);
  if (item.links?.length) {
    parts.push(item.links.map((l) => `${l.label}: ${l.href}`).join("\n"));
  }
  return parts.filter(Boolean).join("\n\n");
}

export function flattenFaqItems(
  categories: { items: FaqItem[] }[]
): { question: string; answer: string }[] {
  return categories.flatMap((category) =>
    category.items.map((item) => ({
      question: item.question,
      answer: flattenAnswer(item),
    }))
  );
}

export default function FaqAccordion({
  items,
  openFirst = false,
}: {
  items: FaqItem[];
  openFirst?: boolean;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details
          key={item.question}
          className="group rounded-xl border border-laf-border bg-white overflow-hidden"
          open={openFirst && i === 0}
        >
          <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-laf-navy flex items-center justify-between gap-4 hover:bg-laf-cream/40 transition-colors [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span className="text-laf-gold text-xl leading-none shrink-0 group-open:rotate-45 transition-transform">
              +
            </span>
          </summary>
          <div className="px-5 pb-5 text-sm text-laf-muted leading-relaxed border-t border-laf-border/60 pt-4 space-y-3">
            <p className="whitespace-pre-line">{item.answer}</p>
            {item.bullets && item.bullets.length > 0 && (
              <ul className="space-y-1.5">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="text-laf-gold font-bold shrink-0" aria-hidden>
                      •
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            {item.after && <p className="whitespace-pre-line">{item.after}</p>}
            {item.links && item.links.length > 0 && (
              <ul className="space-y-2">
                {item.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-laf-gold font-medium hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
