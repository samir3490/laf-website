"use client";

import Image from "next/image";
import { drawingImageSrc } from "@/lib/drawing-image";
import type { DrawingEntry } from "@/lib/drawing";

type DrawingEntryImageProps = {
  entry: Pick<DrawingEntry, "imageUrl" | "driveFileId">;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function DrawingEntryImage({
  entry,
  alt,
  className = "object-contain",
  sizes = "(max-width: 640px) 100vw, 50vw",
  priority,
}: DrawingEntryImageProps) {
  return (
    <Image
      src={drawingImageSrc(entry)}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      unoptimized
      priority={priority}
    />
  );
}
