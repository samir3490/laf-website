import { NextResponse } from "next/server";
import { runBlogScheduleNotifications } from "@/lib/blog-schedule-notify";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";
import { isLibraryAdmin } from "@/lib/library";

export const maxDuration = 30;

async function isAuthorized(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;

  const email = await verifyLibraryAdminRequest(req);
  return Boolean(email && isLibraryAdmin(email));
}

/** Daily cron: email admin when a scheduled post goes live, or when the queue is empty. */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await runBlogScheduleNotifications();
    return NextResponse.json(result, { status: result.ok ? 200 : 503 });
  } catch (err) {
    console.error("[blog/notify-schedule]", err);
    return NextResponse.json({ error: "Notification run failed." }, { status: 500 });
  }
}
