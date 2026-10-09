"use client";

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

/** Accessible file picker with a clear button look for non-technical users. */
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
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-laf-navy mb-1">
        {label}
        {required ? " *" : ""}
        {hint ? <span className="font-normal text-laf-muted"> {hint}</span> : null}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
            disabled
              ? "bg-laf-cream text-laf-muted cursor-not-allowed"
              : "bg-laf-navy text-white hover:bg-laf-navy/90"
          }`}
        >
          Choose file
        </label>
        <input
          id={id}
          type="file"
          required={required}
          disabled={disabled}
          accept={accept}
          capture="environment"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
        <span className="text-sm text-laf-muted break-all">
          {fileName ? fileName : "No file chosen"}
        </span>
      </div>
    </div>
  );
}
