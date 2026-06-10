type GoogleMapsEmbedProps = {
  embedUrl: string;
  title?: string;
};

export default function GoogleMapsEmbed({
  embedUrl,
  title = "Lata Agrawal Foundation on Google Maps",
}: GoogleMapsEmbedProps) {
  return (
    <div className="rounded-2xl border border-laf-border overflow-hidden bg-white shadow-sm">
      <iframe
        title={title}
        src={embedUrl}
        className="w-full h-[480px] lg:h-[560px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
