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

/** Compact date chip for phones: "Mon 17" + "Aug" */
function shortDateParts(isoDate: string): { weekday: string; day: string; month: string } {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return {
    weekday: dt.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
    day: String(d),
    month: dt.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
  };
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
    return [...seen.entries()].map(([date, labelDate]) => ({
      date,
      labelDate,
      ...shortDateParts(date),
    }));
  }, [slots]);

  const timesForDate = useMemo(
    () => slots.filter((s) => s.date === selectedDate),
    [slots, selectedDate]
  );

  const selectedSlot = useMemo(
    () => slots.find((s) => s.startLocal === selectedStart) || null,
    [slots, selectedStart]
  );

  useEffect(() => {
    if (!timesForDate.some((s) => s.startLocal === selectedStart)) {
      setSelectedStart("");
    }
  }, [timesForDate, selectedStart]);

  const book = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book that slot");
      void loadSlots();
    } finally {
      setBooking(false);
    }
  };

  const canSubmit = Boolean(selectedStart && email.trim() && !booking && !loading);

  if (confirmed?.ok) {
    return (
      <div className="rounded-2xl border border-laf-border bg-white p-5 sm:p-8 shadow-sm text-center space-y-3">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-laf-gold">
          Confirmed
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-laf-navy px-1">
          Your intro call is booked
        </h2>
        <p className="text-base text-laf-muted leading-relaxed">
          {confirmed.labelDate}
          <br />
          <span className="font-semibold text-laf-navy">{confirmed.labelTime}</span>
          {confirmed.durationMinutes ? ` · ${confirmed.durationMinutes} min` : ""}
        </p>
        <p className="text-sm text-laf-muted max-w-md mx-auto break-words">
          Calendar invite + Google Meet link sent to{" "}
          <strong className="text-laf-navy">{confirmed.email || email}</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmed(null);
            setSelectedStart("");
            void loadSlots();
          }}
          className="mt-2 w-full sm:w-auto min-h-12 inline-flex items-center justify-center rounded-xl bg-laf-navy text-white px-5 py-3 text-base font-semibold active:scale-[0.99]"
        >
          Book a different time
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void book(e)}
      className="rounded-2xl border border-laf-border bg-white p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6 pb-28 sm:pb-8"
    >
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-laf-navy">
          Pick a {durationMinutes}-minute slot
        </h2>
        <p className="mt-1.5 text-sm text-laf-muted leading-relaxed">
          {workHours
            ? `${workHours.days}, ${formatHour12(workHours.startHour)}–${formatHour12(workHours.endHour)} IST. `
            : null}
          Only open times are shown.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <label className="block text-sm">
          <span className="font-medium text-laf-navy">Your name</span>
          <input
            className="mt-1.5 w-full rounded-xl border border-laf-border px-3.5 py-3 text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            enterKeyHint="next"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-laf-navy">Email</span>
          <input
            type="email"
            required
            inputMode="email"
            className="mt-1.5 w-full rounded-xl border border-laf-border px-3.5 py-3 text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            enterKeyHint="done"
          />
        </label>
      </div>

      {loading ? (
        <div
          className="rounded-2xl border border-laf-border bg-laf-cream/40 px-4 py-10 sm:px-6 sm:py-16 text-center"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white shadow-sm border border-laf-border">
            <svg
              className="h-10 w-10 sm:h-12 sm:w-12 text-laf-gold animate-spin"
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
          <p className="mt-2 text-sm text-laf-muted max-w-sm mx-auto px-2">
            Checking the calendar for open slots. This can take a few seconds…
          </p>
          <div className="mt-6 space-y-3" aria-hidden="true">
            <div className="flex gap-2 overflow-hidden px-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={`d-${i}`}
                  className="h-16 w-14 shrink-0 rounded-xl bg-white/80 border border-laf-border animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={`t-${i}`}
                  className="h-12 rounded-xl bg-white/80 border border-laf-border animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-laf-muted leading-relaxed">
          No open slots in the next two weeks. Please email us and we will find a time together.
        </p>
      ) : (
        <>
          <div>
            <p className="text-sm font-semibold text-laf-navy mb-2">1. Choose a date</p>
            <div className="-mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                {dates.map((d) => {
                  const active = selectedDate === d.date;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDate(d.date)}
                      className={`snap-start shrink-0 w-[4.5rem] min-h-[4.5rem] rounded-xl border px-2 py-2.5 text-center transition active:scale-[0.98] ${
                        active
                          ? "border-laf-gold bg-laf-navy text-white shadow-sm"
                          : "border-laf-border bg-white text-laf-navy"
                      }`}
                      aria-pressed={active}
                      aria-label={d.labelDate}
                    >
                      <span
                        className={`block text-[11px] font-semibold uppercase tracking-wide ${
                          active ? "text-white/80" : "text-laf-muted"
                        }`}
                      >
                        {d.weekday}
                      </span>
                      <span className="block text-xl font-bold leading-tight mt-0.5">{d.day}</span>
                      <span
                        className={`block text-[11px] font-medium ${
                          active ? "text-white/80" : "text-laf-muted"
                        }`}
                      >
                        {d.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedDate ? (
              <p className="mt-2 text-xs text-laf-muted sm:hidden">
                {dates.find((d) => d.date === selectedDate)?.labelDate}
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-laf-navy mb-2">2. Choose a time (IST)</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {timesForDate.map((slot) => {
                const active = selectedStart === slot.startLocal;
                return (
                  <button
                    key={slot.startLocal}
                    type="button"
                    onClick={() => {
                      setSelectedStart(slot.startLocal);
                      setError("");
                    }}
                    className={`min-h-12 rounded-xl border px-3 py-3 text-base font-semibold transition active:scale-[0.98] ${
                      active
                        ? "border-laf-gold bg-laf-gold text-white shadow-sm"
                        : "border-laf-border bg-laf-cream/50 text-laf-navy"
                    }`}
                    aria-pressed={active}
                  >
                    {slot.labelTime.replace(" IST", "")}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {error ? <p className="text-sm text-red-600 leading-relaxed">{error}</p> : null}

      {/* Desktop / tablet confirm */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="hidden sm:inline-flex items-center justify-center rounded-xl bg-laf-gold text-white px-6 py-3 text-base font-bold hover:bg-laf-gold/90 disabled:opacity-50 min-h-12"
      >
        {booking ? "Booking…" : "Confirm meeting"}
      </button>

      {/* Mobile sticky confirm */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-laf-border bg-white/95 backdrop-blur-sm px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {selectedSlot ? (
          <p className="text-xs text-laf-muted mb-2 truncate">
            <span className="font-semibold text-laf-navy">{selectedSlot.labelDate}</span>
            {" · "}
            {selectedSlot.labelTime}
          </p>
        ) : (
          <p className="text-xs text-laf-muted mb-2">Select a date and time to continue</p>
        )}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void book()}
          className="w-full min-h-12 inline-flex items-center justify-center rounded-xl bg-laf-gold text-white px-5 py-3 text-base font-bold disabled:opacity-45 active:scale-[0.99]"
        >
          {booking ? "Booking…" : "Confirm meeting"}
        </button>
      </div>
    </form>
  );
}
