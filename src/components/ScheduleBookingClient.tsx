"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Slot = {
  startLocal: string;
  date: string;
  time: string;
  labelDate: string;
  labelTime: string;
};

type SlotsResponse = {
  ok: boolean;
  error?: string;
  timezone?: string;
  durationMinutes?: number;
  workHours?: { startHour: number; endHour: number; days: string };
  slots?: Slot[];
};

type BookResponse = {
  ok: boolean;
  error?: string;
  labelDate?: string;
  labelTime?: string;
  durationMinutes?: number;
  email?: string;
};

function formatHour12(hour24: number): string {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;
  return `${hour} ${suffix}`;
}

export default function ScheduleBookingClient({
  initialEmail = "",
  initialName = "",
}: {
  initialEmail?: string;
  initialName?: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [workHours, setWorkHours] = useState<SlotsResponse["workHours"]>();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<BookResponse | null>(null);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meeting/slots", { cache: "no-store" });
      const data = (await res.json()) as SlotsResponse;
      if (!data.ok) throw new Error(data.error || "Could not load available times");
      setSlots(data.slots || []);
      if (data.durationMinutes) setDurationMinutes(data.durationMinutes);
      if (data.workHours) setWorkHours(data.workHours);
      const firstDate = data.slots?.[0]?.date || "";
      setSelectedDate((prev) => prev || firstDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load available times");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const dates = useMemo(() => {
    const seen = new Map<string, string>();
    for (const slot of slots) {
      if (!seen.has(slot.date)) seen.set(slot.date, slot.labelDate);
    }
    return [...seen.entries()].map(([date, labelDate]) => ({ date, labelDate }));
  }, [slots]);

  const timesForDate = useMemo(
    () => slots.filter((s) => s.date === selectedDate),
    [slots, selectedDate]
  );

  useEffect(() => {
    if (!timesForDate.some((s) => s.startLocal === selectedStart)) {
      setSelectedStart("");
    }
  }, [timesForDate, selectedStart]);

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStart) {
      setError("Please select a time slot.");
      return;
    }
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/meeting/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          startLocal: selectedStart,
        }),
      });
      const data = (await res.json()) as BookResponse;
      if (!data.ok) throw new Error(data.error || "Could not book that slot");
      setConfirmed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book that slot");
      void loadSlots();
    } finally {
      setBooking(false);
    }
  };

  if (confirmed?.ok) {
    return (
      <div className="rounded-2xl border border-laf-border bg-white p-6 md:p-8 shadow-sm text-center space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-laf-gold">Confirmed</p>
        <h2 className="text-2xl font-bold text-laf-navy">Your intro call is booked</h2>
        <p className="text-laf-muted">
          {confirmed.labelDate}
          <br />
          {confirmed.labelTime}
          {confirmed.durationMinutes ? ` · ${confirmed.durationMinutes} minutes` : ""}
        </p>
        <p className="text-sm text-laf-muted max-w-md mx-auto">
          A calendar invitation with the Google Meet link has been sent to{" "}
          <strong className="text-laf-navy">{confirmed.email || email}</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmed(null);
            setSelectedStart("");
            void loadSlots();
          }}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-laf-navy text-white px-4 py-2.5 text-sm font-semibold hover:bg-laf-navy/90"
        >
          Book a different time
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void book(e)}
      className="rounded-2xl border border-laf-border bg-white p-6 md:p-8 shadow-sm space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-laf-navy">Pick a {durationMinutes}-minute slot</h2>
        <p className="mt-2 text-sm text-laf-muted">
          {workHours
            ? `${workHours.days}, ${formatHour12(workHours.startHour)}–${formatHour12(workHours.endHour)} IST. `
            : null}
          Available times update from our calendar so you only see open slots.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="font-medium text-laf-navy">Your name</span>
          <input
            className="mt-1.5 w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-laf-navy">Email</span>
          <input
            type="email"
            required
            className="mt-1.5 w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
      </div>

      {loading ? (
        <div
          className="rounded-2xl border border-laf-border bg-laf-cream/40 px-6 py-12 sm:py-16 text-center"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm border border-laf-border">
            <svg
              className="h-12 w-12 text-laf-gold animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
              />
            </svg>
          </div>
          <p className="text-lg sm:text-xl font-bold text-laf-navy">Loading available times</p>
          <p className="mt-2 text-sm sm:text-base text-laf-muted max-w-md mx-auto">
            Checking the calendar for open {durationMinutes}-minute slots. This can take a few
            seconds…
          </p>
          <div className="mt-8 space-y-4 max-w-lg mx-auto" aria-hidden="true">
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`d-${i}`}
                  className="h-10 w-28 rounded-lg bg-white/80 border border-laf-border animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={`t-${i}`}
                  className="h-11 rounded-lg bg-white/80 border border-laf-border animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-laf-muted">
          No open slots in the next two weeks. Please email us and we will find a time together.
        </p>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium text-laf-navy mb-2">Date</p>
            <div className="flex flex-wrap gap-2">
              {dates.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedDate === d.date
                      ? "border-laf-gold bg-laf-gold/10 text-laf-navy font-semibold"
                      : "border-laf-border bg-white text-laf-muted hover:border-laf-gold/50"
                  }`}
                >
                  {d.labelDate}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-laf-navy mb-2">Time (IST)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {timesForDate.map((slot) => (
                <button
                  key={slot.startLocal}
                  type="button"
                  onClick={() => setSelectedStart(slot.startLocal)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    selectedStart === slot.startLocal
                      ? "border-laf-gold bg-laf-navy text-white"
                      : "border-laf-border bg-laf-cream/40 text-laf-navy hover:border-laf-gold/60"
                  }`}
                >
                  {slot.labelTime.replace(" IST", "")}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={booking || loading || !selectedStart || !email.trim()}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-laf-gold text-white px-5 py-2.5 text-sm font-bold hover:bg-laf-gold/90 disabled:opacity-50"
      >
        {booking ? "Booking…" : "Confirm meeting"}
      </button>
    </form>
  );
}
