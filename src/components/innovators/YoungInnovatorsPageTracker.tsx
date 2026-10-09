"use client";

import EventAnalytics from "@/components/events/EventAnalytics";
import { YOUNG_INNOVATORS_2026_EVENT_SLUG } from "@/lib/event-submissions";

export default function YoungInnovatorsPageTracker({
  page,
}: {
  page: "home" | "gallery" | "submit";
}) {
  return <EventAnalytics eventSlug={YOUNG_INNOVATORS_2026_EVENT_SLUG} page={page} />;
}
