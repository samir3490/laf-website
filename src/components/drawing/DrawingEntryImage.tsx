"use client";

import { useState } from "react";
import Image from "next/image";
import DrawingImageLightbox from "@/components/drawing/DrawingImageLightbox";
import { drawingImageSrc } from "@/lib/drawing-image";
import type { DrawingEntry } from "@/lib/drawing";

type DrawingEntryImageProps = {
  entry: Pick<DrawingEntry, "imageUrl" | "driveFileId">;
  alt: string;
  caption?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** When true (default), click opens a full-screen lightbox. */
  lightbox?: boolean;
};

export default function DrawingEntryImage({
  entry,
  alt,
  caption,
  className = "object-contain",
  sizes = "(max-width: 640px) 100vw, 50vw",
  priority,
  lightbox = true,
}: DrawingEntryImageProps) {
  const [open, setOpen] = useState(false);
  const src = drawingImageSrc(entry);

  const image = (
    <Image
      src={src}
      alt={alt}
      fill
      className={`${className}${lightbox ? " transition-transform duration-300 group-hover:scale-[1.02]" : ""}`}
      sizes={sizes}
      unoptimized
      priority={priority}
    />
  );

  if (!lightbox) {
    return image;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-inset focus:ring-laf-gold/50"
        aria-label={`View full size: ${alt}`}
      >
        {image}
      </button>
      {open && (
        <DrawingImageLightbox
          src={src}
          alt={alt}
          caption={caption}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
