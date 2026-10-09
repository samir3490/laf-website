/**
 * All LAF website event submissions (Young Innovators, future competitions) live in one
 * Firestore collection. Writes go through Next.js API routes + Admin SDK only.
 *
 * When adding a new event:
 * 1. Add a constant event slug below (e.g. `my-event-2027`).
 * 2. Build pages + `/api/.../submit` that set `eventSlug` on the document.
 * 3. Do not add new Firestore rules — `laf_event_submissions` is already locked down.
 *
 * Drawing competition stays on `drawing_entries` (public gallery + voting).
 */
export const LAF_EVENT_SUBMISSIONS_COLLECTION = "laf_event_submissions";

export const YOUNG_INNOVATORS_2026_EVENT_SLUG = "young-innovators-2026";

export type LafEventSubmissionStatus = "pending" | "approved" | "rejected";
