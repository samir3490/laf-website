export const YOUNG_INNOVATORS_PROMO_IMAGE =
  "/images/events/young-innovators-challenge-promo.jpg";

export const YOUNG_INNOVATORS_PROMO_ALT =
  "Indian children creating science inventions and eco-friendly models at home for the Young Innovators Challenge";

export const YOUNG_INNOVATORS_DATES = {
  start: "2026-10-09",
  end: "2026-12-31",
  label: "9 October – 31 December 2026",
  labelShort: "9 Oct – 31 Dec 2026",
} as const;

export const YOUNG_INNOVATORS_AGE = { min: 6, max: 16 } as const;

/** Keep under Vercel serverless body limits; same ballpark as drawing competition. */
export const MAX_INNOVATORS_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export const INNOVATORS_PHOTO_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isYoungInnovatorsOpen(now = new Date()): boolean {
  const start = new Date(`${YOUNG_INNOVATORS_DATES.start}T00:00:00+05:30`);
  const end = new Date(`${YOUNG_INNOVATORS_DATES.end}T23:59:59+05:30`);
  return now >= start && now <= end;
}

export function isValidInnovatorsEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeInnovatorsEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeIndiaPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91") && /^91[6-9]/.test(digits)) {
    return `+${digits}`;
  }
  return null;
}

/** Photos uploaded via our Drive Apps Script, or shared Drive/YouTube links for video. */
export function isAllowedDriveOrVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return (
      host === "drive.google.com" ||
      host === "docs.google.com" ||
      host.endsWith("googleusercontent.com") ||
      host === "youtube.com" ||
      host === "youtu.be" ||
      host === "m.youtube.com"
    );
  } catch {
    return false;
  }
}

export function isAllowedVideoLink(url: string): boolean {
  return isAllowedDriveOrVideoUrl(url);
}
