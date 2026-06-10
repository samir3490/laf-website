type FaqItem = { question: string; answer: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details
          key={item.question}
          className="group rounded-xl border border-laf-border bg-white overflow-hidden"
          open={i === 0}
        >
          <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-laf-navy flex items-center justify-between gap-4 hover:bg-laf-cream/40 transition-colors [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span className="text-laf-gold text-xl leading-none shrink-0 group-open:rotate-45 transition-transform">
              +
            </span>
          </summary>
          <div className="px-5 pb-5 text-sm text-laf-muted leading-relaxed border-t border-laf-border/60 pt-4">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
