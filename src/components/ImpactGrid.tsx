type ImpactItem = { value: string; label: string };

export default function ImpactGrid({ items }: { items: ImpactItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-laf-navy/20 bg-white p-5 lg:p-6 text-center shadow-sm hover:shadow-md hover:border-laf-gold/50 transition-all"
        >
          <p className="text-3xl lg:text-4xl font-bold text-laf-gold tabular-nums">{item.value}</p>
          <p className="mt-2 text-xs sm:text-sm text-laf-muted leading-snug">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
