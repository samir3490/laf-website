"use client";

import { useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import Link from "next/link";
import {
  getFirebaseConfig,
  getFirebaseDb,
  LIBRARY_RESOURCES_COLLECTION,
  LIBRARY_SUBMISSIONS_COLLECTION,
} from "@/lib/firebase";

type AnalysisResult = {
  url: string;
  urlNormalized: string;
  title: string;
  description: string;
  ogImage?: string;
  favicon?: string;
  categories: string[];
  ageGroups: string[];
  difficulty: string;
  cost: string;
  languages: string[];
  module: string;
  safetyScore: number;
  educationalScore: number;
  rejected: boolean;
  rejectReason: string | null;
};

export default function SubmitResourceForm() {
  const config = getFirebaseConfig();
  const db = getFirebaseDb();

  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [rejected, setRejected] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!db) {
      setError("Library is not configured yet. Please try again later.");
      return;
    }

    setLoading(true);
    setError("");
    setDone(false);
    setRejected(false);

    try {
      const res = await fetch("/api/library/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        return;
      }

      const analysis = data as AnalysisResult;

      if (analysis.rejected) {
        setRejected(true);
        setError(analysis.rejectReason ?? "This website did not pass our safety review.");
        return;
      }

      const dupQuery = query(
        collection(db, LIBRARY_RESOURCES_COLLECTION),
        where("urlNormalized", "==", analysis.urlNormalized)
      );
      const dupSnap = await getDocs(dupQuery);
      if (!dupSnap.empty) {
        setError("This website is already in our library.");
        return;
      }

      await addDoc(collection(db, LIBRARY_SUBMISSIONS_COLLECTION), {
        url: analysis.url,
        urlNormalized: analysis.urlNormalized,
        title: analysis.title,
        description: analysis.description,
        ogImage: analysis.ogImage ?? "",
        favicon: analysis.favicon ?? "",
        categories: analysis.categories,
        ageGroups: analysis.ageGroups,
        difficulty: analysis.difficulty,
        cost: analysis.cost,
        languages: analysis.languages,
        module: analysis.module,
        safetyScore: analysis.safetyScore,
        educationalScore: analysis.educationalScore,
        status: "pending",
        submitterEmail: email.trim() || null,
        createdAt: serverTimestamp(),
      });

      setDone(true);
      setUrl("");
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!config || !db) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-laf-navy font-semibold">Library setup required</p>
        <p className="mt-2 text-sm text-laf-muted">Firebase environment variables are missing.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-laf-navy">Thank you for your suggestion!</p>
        <p className="mt-2 text-sm text-laf-muted">
          Our team will review your submission. Approved resources appear in the public library.
        </p>
        <Link
          href="/library"
          className="inline-block mt-6 text-sm font-medium text-laf-gold hover:underline"
        >
          ← Back to library
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-laf-border bg-white p-6 lg:p-8 space-y-5 max-w-xl">
      <div>
        <label htmlFor="resource-url" className="block text-sm font-medium text-laf-navy mb-2">
          Website URL
        </label>
        <input
          id="resource-url"
          type="url"
          required
          placeholder="https://scratch.mit.edu"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
        />
      </div>

      <div>
        <label htmlFor="submitter-email" className="block text-sm font-medium text-laf-navy mb-2">
          Your email (optional)
        </label>
        <input
          id="submitter-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
        />
      </div>

      {error && (
        <p className={`text-sm ${rejected ? "text-amber-800" : "text-red-600"}`} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors disabled:opacity-60"
      >
        {loading ? "Analyzing website…" : "Submit Resource"}
      </button>

      <p className="text-xs text-laf-muted leading-relaxed">
        We fetch the homepage and metadata only. All submissions are reviewed by our team before
        publishing. Inappropriate or unsafe sites are rejected automatically.
      </p>
    </form>
  );
}
