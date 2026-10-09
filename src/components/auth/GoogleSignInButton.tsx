"use client";

import { GoogleAuthProvider, signInWithPopup, type Auth } from "firebase/auth";

type GoogleSignInButtonProps = {
  auth: Auth | null;
  label?: string;
  disabled?: boolean;
  onError?: (message: string) => void;
  onBusy?: (busy: boolean) => void;
  className?: string;
};

/** Shared Google sign-in / sign-up button for Events and admin pages. */
export default function GoogleSignInButton({
  auth,
  label = "Continue with Google",
  disabled,
  onError,
  onBusy,
  className = "",
}: GoogleSignInButtonProps) {
  async function handleClick() {
    if (!auth) {
      onError?.("Sign-in is not available right now.");
      return;
    }
    onBusy?.(true);
    onError?.("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      onError?.("Google sign-in failed. Please try again.");
    } finally {
      onBusy?.(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || !auth}
      onClick={() => void handleClick()}
      className={
        className ||
        "w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-[#1e3a5f] bg-white text-[#1e3a5f] text-sm font-semibold hover:bg-laf-cream/60 disabled:opacity-60"
      }
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  );
}
