import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const APPS_SCRIPT_URL = (process.env.MEETING_BOOKING_API_URL || "").trim();
const BOOKING_SECRET = (process.env.MEETING_BOOKING_SECRET || "").trim();

const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function missingConfig() {
  return NextResponse.json(
    { ok: false, error: "Meeting booking is not configured yet." },
    { status: 503 }
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

export async function POST(req: Request) {
  if (!APPS_SCRIPT_URL) return missingConfig();

  const ip = clientIp(req);
  if (!checkRateLimit(`meeting-book:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { ok: false, error: "Too many booking attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      startLocal?: string;
    };
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = String(body.name || "").trim();
    const startLocal = String(body.startLocal || "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
    }
    if (!startLocal) {
      return NextResponse.json({ ok: false, error: "Please select a time slot." }, { status: 400 });
    }

    const data = await fetchAppsScript({
      action: "book",
      email,
      name,
      startLocal,
    });
    if (!data) return missingConfig();
    if (!data.ok) {
      return NextResponse.json(data, { status: 409 });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not book meeting";
    console.error("[meeting/book]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
