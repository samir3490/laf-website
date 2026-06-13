"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TurnstileWidget from "@/components/library/TurnstileWidget";
import { getFirebaseConfig } from "@/lib/firebase";
import { trackDrawingSubmit } from "@/lib/gtag";
import { MAX_DRAWING_BYTES } from "@/lib/drawing";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const GALLERY_PATH = "/events/drawing-competition";

type SubmitDrawingFormProps = {
  submissionsAllowed: boolean;
};

export default function SubmitDrawingForm({ submissionsAllowed }: SubmitDrawingFormProps) {
  const router = useRouter();
  const config = getFirebaseConfig();

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [artistAge, setArtistAge] = useState("");
  const [artistClass, setArtistClass] = useState("");
  const [artistSchool, setArtistSchool] = useState("");
  const [artistCity, setArtistCity] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const turnstileRequired = Boolean(TURNSTILE_SITE_KEY);
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(""), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!submissionsAllowed) {
      setError("Submissions are closed for this competition.");
      return;
    }
    if (!image) {
      setError("Please choose an image to upload.");
      return;
    }
    if (image.size > MAX_DRAWING_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    if (!termsAccepted) {
      setError("Please confirm this is your original artwork.");
      return;
    }
    if (turnstileRequired && !turnstileToken) {
      setError("Please complete the captcha.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("artistName", artistName.trim());
      formData.set("artistAge", artistAge.trim());
      formData.set("artistClass", artistClass.trim());
      formData.set("artistSchool", artistSchool.trim());
      formData.set("artistCity", artistCity.trim());
      formData.set("termsAccepted", "true");
      formData.set("image", image);
      if (turnstileToken) formData.set("turnstileToken", turnstileToken);

      const res = await fetch("/api/drawing/submit", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        return;
      }

      trackDrawingSubmit(data.entryId as string);
      router.push(`${GALLERY_PATH}?submitted=1`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!config) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-laf-navy font-semibold">Setup required</p>
        <p className="mt-2 text-sm text-laf-muted">Firebase environment variables are missing.</p>
      </div>
    );
  }

  if (!submissionsAllowed) {
    return (
      <div className="rounded-2xl border border-laf-border bg-white p-8 text-center max-w-xl">
        <p className="text-lg font-semibold text-laf-navy">Submissions are closed</p>
        <p className="mt-2 text-sm text-laf-muted">
          You can still view entries and vote on the gallery page.
        </p>
        <Link
          href={GALLERY_PATH}
          className="inline-block mt-6 text-sm font-medium text-laf-gold hover:underline"
        >
          View gallery
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-laf-border bg-white p-6 lg:p-8 space-y-5 max-w-xl"
    >
      <p className="text-sm text-laf-muted leading-relaxed">
        For child safety, please use a <strong>first name only</strong> (no surname, phone, or home
        address). Parents or guardians may help with the submission.
      </p>

      <div>
        <label htmlFor="drawing-title" className="block text-sm font-medium text-laf-navy mb-2">
          Artwork title
        </label>
        <input
          id="drawing-title"
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
        />
      </div>

      <div>
        <label htmlFor="artist-name" className="block text-sm font-medium text-laf-navy mb-2">
          First name
        </label>
        <input
          id="artist-name"
          type="text"
          required
          maxLength={40}
          placeholder="First name only"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="artist-age" className="block text-sm font-medium text-laf-navy mb-2">
            Age
          </label>
          <input
            id="artist-age"
            type="number"
            min={1}
            max={25}
            required
            value={artistAge}
            onChange={(e) => setArtistAge(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
          />
        </div>
        <div>
          <label htmlFor="artist-class" className="block text-sm font-medium text-laf-navy mb-2">
            Class / grade
          </label>
          <input
            id="artist-class"
            type="text"
            required
            maxLength={20}
            placeholder="e.g. 5, 8th, KG"
            value={artistClass}
            onChange={(e) => setArtistClass(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="artist-school" className="block text-sm font-medium text-laf-navy mb-2">
          School name
        </label>
        <input
          id="artist-school"
          type="text"
          required
          maxLength={100}
          value={artistSchool}
          onChange={(e) => setArtistSchool(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
        />
      </div>

      <div>
        <label htmlFor="artist-city" className="block text-sm font-medium text-laf-navy mb-2">
          City
        </label>
        <input
          id="artist-city"
          type="text"
          required
          maxLength={80}
          value={artistCity}
          onChange={(e) => setArtistCity(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
        />
      </div>

      <div>
        <label htmlFor="drawing-image" className="block text-sm font-medium text-laf-navy mb-2">
          Upload image (JPEG, PNG, or WebP — max 5 MB)
        </label>
        <input
          id="drawing-image"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-laf-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-laf-cream file:text-laf-navy file:font-medium"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-laf-muted cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 rounded border-laf-border"
        />
        <span>
          I confirm this is original artwork and I agree to LAF displaying the first name, age,
          class, school, and city shown above with this entry. Voting is one vote per person per
          entry (best-effort via browser cookie).
        </span>
      </label>

      {turnstileRequired && (
        <TurnstileWidget
          siteKey={TURNSTILE_SITE_KEY}
          onToken={handleTurnstileToken}
          onExpire={handleTurnstileExpire}
        />
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || (turnstileRequired && !turnstileToken)}
        className="px-6 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors disabled:opacity-60"
      >
        {loading ? "Uploading…" : "Submit artwork"}
      </button>
    </form>
  );
}
