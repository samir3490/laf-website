type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="bg-laf-navy text-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-lg text-white/85 max-w-2xl mx-auto">{subtitle}</p>
        )}
        <div className="w-16 h-1 bg-laf-gold mx-auto mt-6 rounded-full" />
      </div>
    </section>
  );
}
