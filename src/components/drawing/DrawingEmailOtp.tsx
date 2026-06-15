"use client";

import { useState } from "react";
import RequiredMark from "@/components/drawing/RequiredMark";

type DrawingEmailOtpProps = {
  email: string;
  onEmailChange: (email: string) => void;
  onVerified: (verifyToken: string) => void;
  onClear?: () => void;
  disabled?: boolean;
};

export default function DrawingEmailOtp({
  email,
  onEmailChange,
  onVerified,
  onClear,
  disabled,
}: DrawingEmailOtpProps) {
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/drawing/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send code.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Could not send code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/drawing/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      setStep("done");
      onVerified(data.verifyToken as string);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function resetVerification() {
    setStep("email");
    setOtp("");
    setError("");
    onClear?.();
  }

  if (step === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <p>
          Email verified: <strong>{email}</strong>
        </p>
        <button type="button" onClick={resetVerification} className="mt-2 text-laf-gold font-medium hover:underline">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-laf-border bg-laf-cream/40 p-4 space-y-3">
      <p className="text-sm font-medium text-laf-navy">Parent / guardian email verification</p>
      <p className="text-xs text-laf-muted">
        We&apos;ll send a 6-digit code to confirm you control this email. It is not shown on the public gallery.
      </p>

      {step === "email" ? (
        <form onSubmit={sendOtp} className="space-y-3">
          <div>
            <label htmlFor="verify-email" className="block text-xs text-laf-muted mb-1">
              Email address
              <RequiredMark />
            </label>
            <input
              id="verify-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              disabled={disabled}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-laf-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
            />
          </div>
          <button
            type="submit"
            disabled={busy || disabled}
            className="px-4 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send verification code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-xs text-laf-muted">Code sent to {email}. Check spam if you don&apos;t see it.</p>
          <div>
            <label htmlFor="email-otp" className="block text-xs text-laf-muted mb-1">
              6-digit code
              <RequiredMark />
            </label>
            <input
              id="email-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full max-w-xs px-4 py-3 rounded-xl border border-laf-border bg-white text-sm tracking-widest"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || otp.length < 6}
              className="px-4 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify email"}
            </button>
            <button type="button" onClick={resetVerification} className="text-sm text-laf-muted hover:underline">
              Change email
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
