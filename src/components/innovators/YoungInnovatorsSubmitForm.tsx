"use client";

import { useCallback, useMemo, useState } from "react";
import TurnstileWidget from "@/components/library/TurnstileWidget";
import {
  INNOVATORS_PHOTO_MIME,
  isYoungInnovatorsOpen,
  MAX_INNOVATORS_PHOTO_BYTES,
  YOUNG_INNOVATORS_AGE,
  YOUNG_INNOVATORS_DATES,
} from "@/lib/young-innovators";

type UploadResult = { url: string; fileId: string };

async function uploadPhotoToDrive(file: File, slot: "photo1" | "photo2"): Promise<UploadResult> {
  const formData = new FormData();
  formData.set("file", file);
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
  const open = useMemo(() => isYoungInnovatorsOpen(), []);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childCity, setChildCity] = useState("");
  const [childSchool, setChildSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState("");

  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(""), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!open) {
      setError("Submissions are closed for this challenge.");
      return;
    }
    if (!photo1 || !photo2) {
      setError("Please choose two project photos.");
      return;
    }
    if (!videoLink.trim()) {
      setError("Please paste a YouTube or Google Drive link to your ~1-minute video.");
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

    for (const [label, file] of [
      ["Photo 1", photo1],
      ["Photo 2", photo2],
    ] as const) {
      if (!INNOVATORS_PHOTO_MIME[file.type] && !file.type.startsWith("image/")) {
        setError(`${label} must be a JPG, PNG, or WebP image.`);
        return;
      }
      if (file.size > MAX_INNOVATORS_PHOTO_BYTES) {
        setError(`${label} must be under 5 MB. Use a smaller photo from your phone gallery.`);
        return;
      }
    }

    setStatus("uploading");

    try {
      setProgress("Uploading photo 1 to LAF Google Drive…");
      const uploaded1 = await uploadPhotoToDrive(photo1, "photo1");

      setProgress("Uploading photo 2 to LAF Google Drive…");
      const uploaded2 = await uploadPhotoToDrive(photo2, "photo2");

      setStatus("saving");
      setProgress("Saving your entry…");

      const res = await fetch("/api/innovators/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          childName: childName.trim(),
          childAge,
          childCity: childCity.trim(),
          childSchool: childSchool.trim(),
          parentName: parentName.trim(),
          parentEmail: parentEmail.trim(),
          parentPhone: parentPhone.trim(),
          photo1Url: uploaded1.url,
          photo2Url: uploaded2.url,
          photo1FileId: uploaded1.fileId,
          photo2FileId: uploaded2.fileId,
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

      setDoneMessage(
        data.message ||
          "Thank you! Your project was submitted. We will email a certificate after review."
      );
      setStatus("done");
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
        closed. Follow us on social media for the next challenge.
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-laf-gold/40 bg-laf-cream/60 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-laf-navy">Project submitted!</h2>
        <p className="text-laf-muted leading-relaxed max-w-lg mx-auto">{doneMessage}</p>
        <p className="text-sm text-laf-muted">
          Keep building and learning. Explore more on our{" "}
          <a href="/library" className="text-laf-gold font-medium hover:underline">
            free learning library
          </a>
          .
        </p>
      </div>
    );
  }

  const busy = status === "uploading" || status === "saving";

  return (
    <form onSubmit={onSubmit} className="relative space-y-6 max-w-2xl">
      <div className="rounded-xl border border-laf-gold/30 bg-laf-cream/50 px-4 py-3 text-sm text-laf-navy space-y-1">
        <p>
          <strong>Easy steps:</strong> fill the form → choose 2 photos → paste a YouTube or Google
          Drive video link → submit.
        </p>
        <p className="text-laf-muted">
          No account or email code needed. Photos are saved to LAF&apos;s Google Drive (same as our
          other events).
        </p>
      </div>

      <fieldset className="space-y-4" disabled={busy}>
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

      <fieldset className="space-y-4" disabled={busy}>
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

      <fieldset className="space-y-4" disabled={busy}>
        <legend className="text-lg font-semibold text-laf-navy">Parent / guardian contact</legend>
        <p className="text-xs text-laf-muted">
          Used only for certificates and LAF contact — not shown publicly.
        </p>
        <div>
          <label htmlFor="yi-parent" className="block text-sm font-medium text-laf-navy mb-1">
            Parent / guardian name *
          </label>
          <input
            id="yi-parent"
            required
            maxLength={80}
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="yi-email" className="block text-sm font-medium text-laf-navy mb-1">
              Email * <span className="font-normal text-laf-muted">(for certificate)</span>
            </label>
            <input
              id="yi-email"
              required
              type="email"
              autoComplete="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
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
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={busy}>
        <legend className="text-lg font-semibold text-laf-navy">Photos &amp; video</legend>
        <div>
          <label htmlFor="yi-p1" className="block text-sm font-medium text-laf-navy mb-1">
            Photo 1 of the project * <span className="font-normal text-laf-muted">(max 5 MB)</span>
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
            Photo 2 of the project * <span className="font-normal text-laf-muted">(max 5 MB)</span>
          </label>
          <input
            id="yi-p2"
            required
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            capture="environment"
            onChange={(e) => setPhoto2(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
        </div>

        <div>
          <label htmlFor="yi-vlink" className="block text-sm font-medium text-laf-navy mb-1">
            1-minute explanation video link * (YouTube or Google Drive)
          </label>
          <input
            id="yi-vlink"
            required
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            placeholder="https://youtu.be/… or https://drive.google.com/file/d/…"
          />
          <p className="mt-2 text-xs text-laf-muted leading-relaxed">
            Easiest on a phone: record ~1 minute in your camera app → upload to{" "}
            <strong>Google Drive</strong> or <strong>YouTube</strong> (unlisted is fine) → copy the
            share link here. Make sure “Anyone with the link” can view Drive files.
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
          disabled={busy}
        />
        <span>
          I confirm this project was made by the child with parental guidance, using materials from
          home, and I allow LAF to review it and feature approved entries for education awareness. *
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
        disabled={busy}
        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright disabled:opacity-60 transition-colors"
      >
        {busy ? "Submitting…" : "Submit project — free"}
      </button>
    </form>
  );
}
