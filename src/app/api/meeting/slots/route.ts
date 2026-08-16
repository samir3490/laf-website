import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = (process.env.MEETING_BOOKING_API_URL || "").trim();
const BOOKING_SECRET = (process.env.MEETING_BOOKING_SECRET || "").trim();

function missingConfig() {
  return NextResponse.json(
    { ok: false, error: "Meeting booking is not configured yet." },
    { status: 503 }
  );
}

/** Apps Script web apps often 302; follow without dropping the query string. */
async function fetchAppsScript(query: Record<string, string>) {
  if (!APPS_SCRIPT_URL) return null;
  const url = new URL(APPS_SCRIPT_URL);
  for (const [key, value] of Object.entries(query)) {
    if (value) url.searchParams.set(key, value);
  }
  if (BOOKING_SECRET) url.searchParams.set("secret", BOOKING_SECRET);

  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`Booking service returned invalid JSON: ${text.slice(0, 200)}`);
  }
}

export async function GET() {
  if (!APPS_SCRIPT_URL) return missingConfig();
  try {
    const data = await fetchAppsScript({ action: "slots" });
    if (!data) return missingConfig();
    if (!data.ok) {
      return NextResponse.json(data, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load slots";
    console.error("[meeting/slots]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
