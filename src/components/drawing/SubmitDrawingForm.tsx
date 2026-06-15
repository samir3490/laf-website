"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DrawingEmailOtp from "@/components/drawing/DrawingEmailOtp";
import RequiredMark from "@/components/drawing/RequiredMark";
import { trackDrawingEvent } from "@/components/drawing/DrawingAnalytics";
import { getStoredDrawingAttribution } from "@/lib/drawing-attribution";
import { trackDrawingSubmit } from "@/lib/gtag";
import { MAX_DRAWING_BYTES } from "@/lib/drawing";

const GALLERY_PATH = "/events/drawing-competition";

type SubmitDrawingFormProps = {
  submissionsAllowed: boolean;
};

export default function SubmitDrawingForm({ submissionsAllowed }: SubmitDrawingFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [artistAge, setArtistAge] = useState("");
  const [artistClass, setArtistClass] = useState("");
  const [artistSchool, setArtistSchool] = useState("");
  const [artistCity, setArtistCity] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!submissionsAllowed) {
      setError("Submissions are closed for this competition.");
      return;
    }
    if (!verifyToken || !emailVerified) {
      setError("Please verify your email with the one-time code before submitting.");
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("artistName", artistName.trim());
      formData.set("parentName", parentName.trim());
      formData.set("parentEmail", parentEmail.trim());
      formData.set("parentPhone", parentPhone.trim());
      formData.set("artistAge", artistAge.trim());
      formData.set("artistClass", artistClass.trim());
      formData.set("artistSchool", artistSchool.trim());
      formData.set("artistCity", artistCity.trim());
      formData.set("termsAccepted", "true");
      formData.set("image", image);
      formData.set("attribution", JSON.stringify(getStoredDrawingAttribution()));

      const res = await fetch("/api/drawing/submit", {
        method: "POST",
        headers: { Authorization: `Bearer ${verifyToken}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        void trackDrawingEvent("submit_failed", "submit");
        return;
      }

      const attribution = getStoredDrawingAttribution();
      trackDrawingSubmit(data.entryId as string, attribution.source);
      void trackDrawingEvent("submit_success", "submit", { entryId: data.entryId as string });
      const thanksQuery = data.published ? "submitted=live" : "submitted=pending";
      router.push(`${GALLERY_PATH}?${thanksQuery}`, { scroll: false });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!submissionsAllowed) {
    return (
      <div className="rounded-2xl border border-laf-border bg-white p-8 text-center max-w-xl">
        <p className="text-lg font-semibold text-laf-navy">Submissions are closed</p>
        <p className="mt-2 text-sm text-laf-muted">You can still view approved entries and vote on the gallery page.</p>
        <Link href={GALLERY_PATH} className="inline-block mt-6 text-sm font-medium text-laf-gold hover:underline">
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
        For child safety, only the child&apos;s <strong>first name</strong>, age group, class, school, and city are
        shown publicly. Parent email is used for verification only; mobile number is for LAF contact only —
        neither is shown on the gallery. Appropriate artwork is published automatically; others are reviewed by LAF.
      </p>
      <p className="text-xs text-laf-muted">
        Fields marked with <RequiredMark /> are required.
      </p>

      <DrawingEmailOtp
        email={parentEmail}
        onEmailChange={(value) => {
          setParentEmail(value);
          setEmailVerified(false);
          setVerifyToken("");
        }}
        onVerified={(token) => {
          setVerifyToken(token);
          setEmailVerified(true);
        }}
        onClear={() => {
          setVerifyToken("");
          setEmailVerified(false);
        }}
      />

      <div className="border-t border-laf-border pt-5 space-y-5">
        <h3 className="text-sm font-semibold text-laf-navy">Parent / guardian</h3>
        <div>
          <label htmlFor="parent-name" className="block text-sm font-medium text-laf-navy mb-2">
            Parent / guardian name
            <RequiredMark />
          </label>
          <input
            id="parent-name"
            type="text"
            required
            maxLength={80}
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
          />
        </div>
        <div>
          <label htmlFor="parent-phone" className="block text-sm font-medium text-laf-navy mb-2">
            Mobile number
            <RequiredMark />
          </label>
          <input
            id="parent-phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="e.g. 9421095604 or +91 94210 95604"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
          />
          <p className="mt-1.5 text-xs text-laf-muted">
            For LAF to reach you about the competition. We verify by email only — no SMS code.
          </p>
        </div>
      </div>

      <div className="border-t border-laf-border pt-5 space-y-5">
        <h3 className="text-sm font-semibold text-laf-navy">Child &amp; artwork</h3>
        <div>
          <label htmlFor="drawing-title" className="block text-sm font-medium text-laf-navy mb-2">
            Artwork title
            <RequiredMark />
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
            Child&apos;s first name
            <RequiredMark />
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
              Age (1–18)
              <RequiredMark />
            </label>
            <input
              id="artist-age"
              type="number"
              min={1}
              max={18}
              required
              value={artistAge}
              onChange={(e) => setArtistAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
            />
          </div>
          <div>
            <label htmlFor="artist-class" className="block text-sm font-medium text-laf-navy mb-2">
              Class / grade
              <RequiredMark />
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
            School name (optional)
          </label>
          <input
            id="artist-school"
            type="text"
            maxLength={100}
            value={artistSchool}
            onChange={(e) => setArtistSchool(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
          />
        </div>

        <div>
          <label htmlFor="artist-city" className="block text-sm font-medium text-laf-navy mb-2">
            City
            <RequiredMark />
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
            <RequiredMark />
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
      </div>

      <label className="flex items-start gap-2 text-sm text-laf-muted cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 rounded border-laf-border"
        />
        <span>
          I confirm this is the child&apos;s original artwork.
          <RequiredMark /> I understand appropriate entries appear in the gallery automatically, others are reviewed
          by LAF, and voting requires signing in with Google (one vote per account per drawing).
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !emailVerified}
        className="px-6 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors disabled:opacity-60"
      >
        {loading ? "Uploading…" : "Submit artwork"}
      </button>
    </form>
  );
}
