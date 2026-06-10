"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/lib/gallery-data";

type PhotoGalleryProps = {
  intro: string;
  categories: string[];
  images: GalleryImage[];
};

export default function PhotoGallery({ intro, categories, images }: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return images;
    return images.filter((img) => img.category === activeCategory);
  }, [activeCategory, images]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null || filtered.length === 0 ? i : (i - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null || filtered.length === 0 ? i : (i + 1) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="space-y-8">
      <p className="text-sm text-laf-muted leading-relaxed max-w-3xl">{intro}</p>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              setLightboxIndex(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-laf-navy text-white"
                : "bg-white border border-laf-border text-laf-muted hover:text-laf-navy"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-laf-muted">No photos in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((img, index) => (
            <button
              key={`${img.src}-${index}`}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-laf-border bg-laf-cream text-left focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
            >
              <Image
                src={img.src}
                alt={img.alt || img.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-laf-navy/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white font-medium line-clamp-2">{img.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-3 md:left-6 z-10 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm"
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-3 md:right-6 z-10 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm"
            aria-label="Next image"
          >
            →
          </button>
          <div
            className="relative w-full max-w-5xl aspect-[16/10] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt || active.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm text-center max-w-xl px-4">
            {active.title}
          </p>
        </div>
      )}
    </div>
  );
}
