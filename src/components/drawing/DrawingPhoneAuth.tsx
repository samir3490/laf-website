"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { normalizeIndiaPhone } from "@/lib/drawing";

type DrawingPhoneAuthProps = {
  onVerified: (user: User, idToken: string) => void;
  onClear?: () => void;
};

export default function DrawingPhoneAuth({ onVerified, onClear }: DrawingPhoneAuthProps) {
  const auth = getFirebaseAuth();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");

  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

  const ensureRecaptcha = useCallback(async () => {
    if (!auth || !recaptchaRef.current) throw new Error("Auth not ready.");
    if (verifierRef.current) return verifierRef.current;
    verifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
      size: "invisible",
    });
    return verifierRef.current;
  }, [auth]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setError("");
    const normalized = normalizeIndiaPhone(phone);
    if (!normalized) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    try {
      const verifier = await ensureRecaptcha();
      const result = await signInWithPhoneNumber(auth, normalized, verifier);
      setConfirmation(result);
      setStep("otp");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/invalid-phone-number") {
        setError("Invalid phone number. Use a 10-digit mobile number.");
      } else {
        setError("Could not send OTP. Check the number and try again.");
      }
      verifierRef.current?.clear();
      verifierRef.current = null;
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmation || !auth) return;
    setError("");
    setBusy(true);
    try {
      const cred = await confirmation.confirm(otp.trim());
      const token = await cred.user.getIdToken();
      const normalized = normalizeIndiaPhone(phone);
      setVerifiedPhone(normalized ?? phone);
      setStep("done");
      onVerified(cred.user, token);
    } catch {
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function resetVerification() {
    setStep("phone");
    setOtp("");
    setConfirmation(null);
    setVerifiedPhone("");
    setError("");
    onClear?.();
    if (auth) {
      auth.signOut().catch(() => undefined);
    }
  }

  if (!auth) {
    return <p className="text-sm text-red-600">Firebase is not configured for phone verification.</p>;
  }

  if (step === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <p>
          Mobile verified: <strong>{verifiedPhone}</strong>
        </p>
        <button type="button" onClick={resetVerification} className="mt-2 text-laf-gold font-medium hover:underline">
          Use a different number
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-laf-border bg-laf-cream/40 p-4 space-y-3">
      <p className="text-sm font-medium text-laf-navy">Parent / guardian mobile verification (OTP)</p>
      <p className="text-xs text-laf-muted">
        Required before upload. We use this to reduce spam — your number is not shown publicly.
      </p>

      {step === "phone" ? (
        <form onSubmit={sendOtp} className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="parent-phone" className="block text-xs text-laf-muted mb-1">
              Mobile number
            </label>
            <div className="flex rounded-xl border border-laf-border bg-white overflow-hidden">
              <span className="px-3 py-3 text-sm text-laf-muted bg-laf-cream/60 border-r border-laf-border">+91</span>
              <input
                id="parent-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="flex-1 px-3 py-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy || phone.length < 10}
            className="px-4 py-3 rounded-xl bg-laf-navy text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <div>
            <label htmlFor="phone-otp" className="block text-xs text-laf-muted mb-1">
              Enter OTP sent to +91{phone}
            </label>
            <input
              id="phone-otp"
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
              {busy ? "Verifying…" : "Verify OTP"}
            </button>
            <button type="button" onClick={resetVerification} className="text-sm text-laf-muted hover:underline">
              Change number
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div ref={recaptchaRef} />
    </div>
  );
}
