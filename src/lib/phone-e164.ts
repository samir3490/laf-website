import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "IN";

export type PhoneCountryOption = {
  iso2: CountryCode;
  dial: string;
  label: string;
};

let cachedOptions: PhoneCountryOption[] | null = null;

export function phoneCountryOptions(): PhoneCountryOption[] {
  if (cachedOptions) return cachedOptions;

  const names = new Intl.DisplayNames(["en"], { type: "region" });
  cachedOptions = getCountries()
    .map((iso2) => ({
      iso2,
      dial: `+${getCountryCallingCode(iso2)}`,
      label: names.of(iso2) ?? iso2,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
  return cachedOptions;
}

const ACCEPTED_TYPES = new Set(["MOBILE", "FIXED_LINE_OR_MOBILE", "PERSONAL_NUMBER"]);

function isCountryCode(value: string): value is CountryCode {
  return /^[A-Z]{2}$/.test(value) && getCountries().includes(value as CountryCode);
}

/**
 * Returns E.164 (+countrycode…) for a real mobile / mobile-or-landline number.
 * Accepts a national number with ISO country, or a full number starting with +.
 */
export function normalizeInternationalMobile(
  raw: string,
  country: string = DEFAULT_PHONE_COUNTRY
): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 24) return null;

  const defaultCountry = isCountryCode(country.toUpperCase())
    ? (country.toUpperCase() as CountryCode)
    : DEFAULT_PHONE_COUNTRY;

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed?.isValid()) return null;

  const type = parsed.getType();
  if (type && !ACCEPTED_TYPES.has(type)) return null;

  return parsed.format("E.164");
}
