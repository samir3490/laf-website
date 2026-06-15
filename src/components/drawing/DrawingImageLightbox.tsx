"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";

type DrawingImageLightboxProps = {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
};

export default function DrawingImageLightbox({
  src,
  alt,
  caption,
  onClose,
}: DrawingImageLightboxProps) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={handleClose}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 text-lg leading-none"
        aria-label="Close"
      >
        ✕
      </button>
      <div
        className="relative w-full max-w-6xl h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="100vw"
          unoptimized
          priority
        />
      </div>
      {(caption ?? alt) && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm text-center max-w-xl px-4">
          {caption ?? alt}
        </p>
      )}
    </div>
  );
}
