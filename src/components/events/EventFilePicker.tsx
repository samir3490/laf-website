"use client";

import { useRef } from "react";

type EventFilePickerProps = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  fileName?: string | null;
  onChange: (file: File | null) => void;
};

/** Accessible file picker with a solid boxed button (not the browser’s plain text control). */
export default function EventFilePicker({
  id,
  label,
  hint,
  required,
  disabled,
  accept = "image/jpeg,image/png,image/webp,image/*",
  fileName,
  onChange,
}: EventFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="block text-sm font-medium text-laf-navy mb-2">
        {label}
        {required ? " *" : ""}
        {hint ? <span className="font-normal text-laf-muted"> {hint}</span> : null}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg border-2 border-[#1e3a5f] bg-[#1e3a5f] text-white text-sm font-semibold shadow-sm hover:bg-[#152a45] hover:border-[#152a45] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Choose file
        </button>

        <input
          ref={inputRef}
          id={id}
          type="file"
          required={required}
          disabled={disabled}
          accept={accept}
          capture="environment"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          tabIndex={-1}
          aria-hidden
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        />

        <span
          className={`inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg border text-sm break-all ${
            fileName
              ? "border-laf-gold/40 bg-laf-cream/60 text-laf-navy font-medium"
              : "border-laf-border bg-white text-laf-muted"
          }`}
        >
          {fileName ? fileName : "No file chosen yet"}
        </span>
      </div>
    </div>
  );
}
