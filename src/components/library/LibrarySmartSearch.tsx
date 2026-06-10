"use client";

import { useState } from "react";
import type { LibraryFilters } from "@/lib/library";

type LibrarySmartSearchProps = {
  onApply: (filters: LibraryFilters, summary: string) => void;
};

export default function LibrarySmartSearch({ onApply }: LibrarySmartSearchProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSummary, setLastSummary] = useState("");
  const [source, setSource] = useState<"gemini" | "heuristic" | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 4) return;

    setLoading(true);
    setError("");
    setLastSummary("");
    setSource(null);

    try {
      const res = await fetch("/api/library/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not understand that question.");
        return;
      }
      setLastSummary(data.summary);
      setSource(data.source === "gemini" ? "gemini" : "heuristic");
      onApply(data.filters, data.summary);
    } catch {
      setError("Something went wrong. Try the regular search below.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-laf-gold/30 bg-gradient-to-br from-laf-cream to-white p-5 lg:p-6 space-y-3">
      <div>
        <p className="text-sm font-semibold text-laf-navy">Ask the library</p>
        <p className="text-xs text-laf-muted mt-0.5">
          Describe what you need in plain English — we&apos;ll find matching resources.
        </p>
      </div>
      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='e.g. "I am 10 and want free coding websites"'
          className="flex-1 px-4 py-2.5 rounded-xl border border-laf-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
          aria-label="Ask the library a question"
        />
        <button
          type="submit"
          disabled={loading || question.trim().length < 4}
          className="px-5 py-2.5 rounded-xl bg-laf-navy text-white text-sm font-semibold hover:bg-laf-navy-soft disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Finding…" : "Find resources"}
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {lastSummary && !error && (
        <p className="text-xs text-laf-muted flex flex-wrap items-center gap-2">
          <span>{lastSummary}</span>
          {source === "gemini" && (
            <span className="px-1.5 py-0.5 rounded bg-laf-navy/8 text-laf-navy text-[10px] font-medium">
              AI
            </span>
          )}
        </p>
      )}
    </div>
  );
}
