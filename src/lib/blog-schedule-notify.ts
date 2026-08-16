import {
  getRecentlyPublishedPosts,
  getScheduledPosts,
  getSite,
  type WpPost,
} from "@/lib/content";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { escapeHtml } from "@/lib/html-escape";
import { ADMIN_EMAIL } from "@/lib/library";
import { isMailConfigured, sendFoundationEmail } from "@/lib/mail";

export const BLOG_SCHEDULE_STATE_DOC = "blog_schedule/notifications";

type ScheduleState = {
  notifiedLiveSlugs?: string[];
  emptyQueueNotified?: boolean;
  lastRunAt?: string;
};

function postUrl(slug: string): string {
  return `${getSite().url.replace(/\/$/, "")}/blog/${slug}`;
}

function formatIst(dateIso: string): string {
  return new Date(dateIso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function loadState(): Promise<ScheduleState> {
  const db = getFirebaseAdminDb();
  if (!db) return {};
  const snap = await db.doc(BLOG_SCHEDULE_STATE_DOC).get();
  return (snap.data() as ScheduleState | undefined) ?? {};
}

async function saveState(state: ScheduleState): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) return;
  await db.doc(BLOG_SCHEDULE_STATE_DOC).set(state, { merge: true });
}

async function emailLivePost(post: WpPost): Promise<boolean> {
  const url = postUrl(post.slug);
  const when = formatIst(post.date);
  return sendFoundationEmail({
    to: ADMIN_EMAIL,
    subject: `Blog post is live — ${post.title}`,
    text: [
      "A scheduled LAF blog post is now live.",
      "",
      `Title: ${post.title}`,
      `Published: ${when} IST`,
      `URL: ${url}`,
      "",
      `Remaining scheduled posts: ${getScheduledPosts().length}`,
    ].join("\n"),
    html: [
      "<p>A scheduled LAF blog post is now <strong>live</strong>.</p>",
      "<ul>",
      `<li><strong>Title:</strong> ${escapeHtml(post.title)}</li>`,
      `<li><strong>Published:</strong> ${escapeHtml(when)} IST</li>`,
      `<li><strong>URL:</strong> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`,
      `<li><strong>Remaining scheduled:</strong> ${getScheduledPosts().length}</li>`,
      "</ul>",
    ].join(""),
  });
}

async function emailEmptyQueue(nextHint: string): Promise<boolean> {
  return sendFoundationEmail({
    to: ADMIN_EMAIL,
    subject: "LAF blog — scheduled posts queue is empty",
    text: [
      "There are no more future-dated blog posts in the queue.",
      "",
      "Please create and schedule new posts so the blog keeps publishing regularly.",
      nextHint,
    ].join("\n"),
    html: [
      "<p>There are <strong>no more future-dated blog posts</strong> in the queue.</p>",
      "<p>Please create and schedule new posts so the blog keeps publishing regularly.</p>",
      `<p>${escapeHtml(nextHint)}</p>`,
    ].join(""),
  });
}

export type BlogScheduleNotifyResult = {
  ok: boolean;
  mailConfigured: boolean;
  liveNotified: string[];
  emptyQueueNotified: boolean;
  remainingScheduled: number;
  error?: string;
};

export async function runBlogScheduleNotifications(
  now = new Date()
): Promise<BlogScheduleNotifyResult> {
  if (!isMailConfigured()) {
    return {
      ok: false,
      mailConfigured: false,
      liveNotified: [],
      emptyQueueNotified: false,
      remainingScheduled: getScheduledPosts(now).length,
      error: "Mail is not configured.",
    };
  }

  if (!getFirebaseAdminDb()) {
    return {
      ok: false,
      mailConfigured: true,
      liveNotified: [],
      emptyQueueNotified: false,
      remainingScheduled: getScheduledPosts(now).length,
      error: "Firebase Admin is not configured.",
    };
  }

  const state = await loadState();
  const notified = new Set(state.notifiedLiveSlugs ?? []);
  const liveNotified: string[] = [];

  const recent = getRecentlyPublishedPosts(36 * 60 * 60 * 1000, now);
  for (const post of recent) {
    if (notified.has(post.slug)) continue;
    const sent = await emailLivePost(post);
    if (sent) {
      notified.add(post.slug);
      liveNotified.push(post.slug);
    }
  }

  const remaining = getScheduledPosts(now);
  let emptyQueueNotified = false;

  if (remaining.length === 0) {
    if (!state.emptyQueueNotified) {
      const sent = await emailEmptyQueue(
        "Tip: schedule posts a few weeks ahead with future dates in posts.json."
      );
      if (sent) emptyQueueNotified = true;
    }
  }

  const nextState: ScheduleState = {
    notifiedLiveSlugs: [...notified].slice(-100),
    emptyQueueNotified: remaining.length === 0 ? state.emptyQueueNotified || emptyQueueNotified : false,
    lastRunAt: now.toISOString(),
  };
  await saveState(nextState);

  return {
    ok: true,
    mailConfigured: true,
    liveNotified,
    emptyQueueNotified: nextState.emptyQueueNotified === true && emptyQueueNotified,
    remainingScheduled: remaining.length,
  };
}
