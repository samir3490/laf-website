"use client";

import { useMemo } from "react";
import type { CountryCode } from "libphonenumber-js";
import { phoneCountryOptions } from "@/lib/phone-e164";

type Props = {
  id: string;
  country: CountryCode;
  nationalNumber: string;
  disabled?: boolean;
  required?: boolean;
  onCountryChange: (iso2: CountryCode) => void;
  onNumberChange: (value: string) => void;
};

export default function InternationalPhoneField({
  id,
  country,
  nationalNumber,
  disabled,
  required = true,
  onCountryChange,
  onNumberChange,
}: Props) {
  const options = useMemo(() => phoneCountryOptions(), []);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-laf-navy mb-1">
        Mobile *
      </label>
      <div className="flex gap-2">
        <label htmlFor={`${id}-country`} className="sr-only">
          Country code
        </label>
        <select
          id={`${id}-country`}
          disabled={disabled}
          value={country}
          onChange={(e) => onCountryChange(e.target.value as CountryCode)}
          className="w-[11.5rem] shrink-0 rounded-lg border border-laf-border px-2 py-2.5 text-sm bg-white"
        >
          {options.map((opt) => (
            <option key={opt.iso2} value={opt.iso2}>
              {opt.dial} {opt.label}
            </option>
          ))}
        </select>
        <input
          id={id}
          required={required}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="Mobile number"
          disabled={disabled}
          value={nationalNumber}
          onChange={(e) => onNumberChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-laf-border px-3 py-2.5 text-sm"
        />
      </div>
      <p className="mt-1 text-xs text-laf-muted">
        Pick your country, then enter the number. India is the default. You can also paste a full
        number starting with +.
      </p>
    </div>
  );
}
