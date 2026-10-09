"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EventEmailOtp from "@/components/events/EventEmailOtp";
import TurnstileWidget from "@/components/library/TurnstileWidget";
import { compressImageForUpload } from "@/lib/compress-image";
import { YOUNG_INNOVATORS_2026_EVENT_SLUG } from "@/lib/event-submissions";
import {
  isYoungInnovatorsOpen,
  YOUNG_INNOVATORS_AGE,
  YOUNG_INNOVATORS_DATES,
} from "@/lib/young-innovators";

type UploadResult = { url: string; fileId: string };

async function uploadPhotoToDrive(file: File, slot: "photo1" | "photo2"): Promise<UploadResult> {
  const compressed = await compressImageForUpload(file);
  const formData = new FormData();
  formData.set("file", compressed);
  formData.set("slot", slot);

  const res = await fetch("/api/innovators/upload", {
    method: "POST",
    body: formData,
  });
  const data = (await res.json()) as { error?: string; url?: string; fileId?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Photo upload failed.");
  }
  return { url: data.url, fileId: data.fileId || "" };
}

export default function YoungInnovatorsSubmitForm() {
  const router = useRouter();
  const open = useMemo(() => isYoungInnovatorsOpen(), []);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const [verifyToken, setVerifyToken] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childCity, setChildCity] = useState("");
  const [childSchool, setChildSchool] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "error">("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(""), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!open) {
      setError("Submissions are closed for this challenge.");
      return;
    }
    if (!verifyToken) {
      setError("Please verify your email first (Step 1).");
      return;
    }
    if (!photo1) {
      setError("Please choose at least one project photo.");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the terms to continue.");
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the captcha.");
      return;
    }

    setStatus("uploading");

    try {
      setProgress("Preparing and uploading photo…");
      const uploaded1 = await uploadPhotoToDrive(photo1, "photo1");

      let uploaded2: UploadResult | null = null;
      if (photo2) {
        setProgress("Uploading second photo…");
        uploaded2 = await uploadPhotoToDrive(photo2, "photo2");
      }

      setStatus("saving");
      setProgress("Saving your entry…");

      const res = await fetch("/api/innovators/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifyToken,
          title: title.trim(),
          description: description.trim(),
          childName: childName.trim(),
          childAge,
          childCity: childCity.trim(),
          childSchool: childSchool.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          photo1Url: uploaded1.url,
          photo2Url: uploaded2?.url ?? "",
          photo1FileId: uploaded1.fileId,
          photo2FileId: uploaded2?.fileId ?? "",
          videoUrl: videoLink.trim(),
          termsAccepted: true,
          turnstileToken,
          website,
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      router.push("/events/young-innovators/gallery?submitted=pending");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setProgress("");
    }
  }

  if (!open) {
    return (
      <div className="rounded-2xl border border-laf-border bg-laf-cream/50 p-6 text-sm text-laf-muted">
        Submissions for the Young Innovators Challenge ({YOUNG_INNOVATORS_DATES.label}) are currently
        closed. You can still{" "}
        <a href="/events/young-innovators/gallery" className="text-laf-gold font-medium hover:underline">
          browse the gallery
        </a>
        .
      </div>
    );
  }

  const busy = status === "uploading" || status === "saving";

  return (
    <form onSubmit={onSubmit} className="relative space-y-6 max-w-2xl">
      <div className="rounded-xl border border-laf-gold/30 bg-laf-cream/50 px-4 py-3 text-sm text-laf-navy space-y-1">
        <p>
          <strong>Easy steps:</strong> verify email → fill the form → add at least one photo →
          submit. A second photo and video link are optional.
        </p>
        <p className="text-laf-muted">
          No password needed. We only send a one-time code to your email. Projects appear in the
          gallery after LAF reviews them.
        </p>
      </div>

      <EventEmailOtp
        eventSlug={YOUNG_INNOVATORS_2026_EVENT_SLUG}
        email={contactEmail}
        onEmailChange={setContactEmail}
        onVerified={setVerifyToken}
        onClear={() => setVerifyToken("")}
        disabled={busy}
        eventLabel="Young Innovators Challenge"
      />

      <fieldset className="space-y-4" disabled={busy || !verifyToken}>
        <legend className="text-lg font-semibold text-laf-navy">About the project</legend>
        <div>
          <label htmlFor="yi-title" className="block text-sm font-medium text-laf-navy mb-1">
            Project title *
          </label>
          <input
            id="yi-title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            placeholder="e.g. Bottle bird feeder"
          />
        </div>
        <div>
          <label htmlFor="yi-desc" className="block text-sm font-medium text-laf-navy mb-1">
            Description * <span className="font-normal text-laf-muted">(materials + how it works)</span>
          </label>
          <textarea
            id="yi-desc"
            required
            rows={5}
            minLength={20}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            placeholder="What did you make? What materials did you use from home? How does it help?"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={busy || !verifyToken}>
        <legend className="text-lg font-semibold text-laf-navy">Child details</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="yi-child" className="block text-sm font-medium text-laf-navy mb-1">
              Child&apos;s first name *
            </label>
            <input
              id="yi-child"
              required
              maxLength={40}
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="yi-age" className="block text-sm font-medium text-laf-navy mb-1">
              Age * ({YOUNG_INNOVATORS_AGE.min}–{YOUNG_INNOVATORS_AGE.max})
            </label>
            <input
              id="yi-age"
              required
              type="number"
              min={YOUNG_INNOVATORS_AGE.min}
              max={YOUNG_INNOVATORS_AGE.max}
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="yi-city" className="block text-sm font-medium text-laf-navy mb-1">
              City *
            </label>
            <input
              id="yi-city"
              required
              maxLength={80}
              value={childCity}
              onChange={(e) => setChildCity(e.target.value)}
              className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="yi-school" className="block text-sm font-medium text-laf-navy mb-1">
              School <span className="font-normal text-laf-muted">(optional)</span>
            </label>
            <input
              id="yi-school"
              maxLength={120}
              value={childSchool}
              onChange={(e) => setChildSchool(e.target.value)}
              className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={busy || !verifyToken}>
        <legend className="text-lg font-semibold text-laf-navy">Your contact details</legend>
        <p className="text-xs text-laf-muted">
          Used only for certificates and LAF contact — not shown on the public gallery. Email must
          match the address you verified above.
        </p>
        <div>
          <label htmlFor="yi-contact" className="block text-sm font-medium text-laf-navy mb-1">
            Your name *
          </label>
          <input
            id="yi-contact"
            required
            maxLength={80}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="yi-phone" className="block text-sm font-medium text-laf-navy mb-1">
            Mobile (WhatsApp) *
          </label>
          <input
            id="yi-phone"
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit number"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={busy || !verifyToken}>
        <legend className="text-lg font-semibold text-laf-navy">Photos &amp; video</legend>
        <div>
          <label htmlFor="yi-p1" className="block text-sm font-medium text-laf-navy mb-1">
            Photo of the project *{" "}
            <span className="font-normal text-laf-muted">(required — JPG/PNG preferred)</span>
          </label>
          <input
            id="yi-p1"
            required
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            capture="environment"
            onChange={(e) => setPhoto1(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
        </div>
        <div>
          <label htmlFor="yi-p2" className="block text-sm font-medium text-laf-navy mb-1">
            Second photo{" "}
            <span className="font-normal text-laf-muted">(optional)</span>
          </label>
          <input
            id="yi-p2"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            capture="environment"
            onChange={(e) => setPhoto2(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
        </div>

        <div>
          <label htmlFor="yi-vlink" className="block text-sm font-medium text-laf-navy mb-1">
            Explanation video link{" "}
            <span className="font-normal text-laf-muted">(optional — YouTube or Google Drive)</span>
          </label>
          <input
            id="yi-vlink"
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            placeholder="https://youtu.be/… or https://drive.google.com/file/d/…"
          />
          <p className="mt-2 text-xs text-laf-muted leading-relaxed">
            Optional. YouTube (unlisted is fine) works best in the gallery. For Drive: set “Anyone
            with the link can view.”
          </p>
        </div>
      </fieldset>

      <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden>
        <label htmlFor="yi-website">Website</label>
        <input
          id="yi-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <label className="flex gap-3 items-start text-sm text-laf-muted">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1"
          disabled={busy || !verifyToken}
        />
        <span>
          I confirm this project was made by the child with guidance, using materials from home, and
          I allow LAF to review it and feature approved entries in the public gallery. *
        </span>
      </label>

      {turnstileSiteKey ? (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onToken={handleTurnstileToken}
          onExpire={handleTurnstileExpire}
        />
      ) : null}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {busy && progress && (
        <p className="text-sm text-laf-navy bg-laf-cream rounded-lg px-4 py-3 font-medium">{progress}</p>
      )}

      <button
        type="submit"
        disabled={busy || !verifyToken}
        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright disabled:opacity-60 transition-colors"
      >
        {busy ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
