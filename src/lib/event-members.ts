import { isLibraryAdmin } from "@/lib/library";

/**
 * Signed-in events members (signup on /events).
 * Used for “email me about new events” and to show admin approve links.
 */
export const LAF_EVENT_MEMBERS_COLLECTION = "laf_event_members";

export type LafEventMember = {
  uid: string;
  email: string;
  displayName: string | null;
  notifyNewEvents: boolean;
  provider: string | null;
  welcomeSentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export function isEventsAdmin(email: string | null | undefined): boolean {
  return isLibraryAdmin(email);
}

export const EVENTS_SITE_ORIGIN = "https://agrawalfoundation.org";
