import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { sendNewEventAnnouncementEmail } from "@/lib/event-members-notify";
import { isEventsAdmin, LAF_EVENT_MEMBERS_COLLECTION } from "@/lib/event-members";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";
import { isMailConfigured } from "@/lib/mail";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const MAX_RECIPIENTS_PER_RUN = 200;

export async function POST(req: Request) {
  try {
    const email = await verifyLibraryAdminRequest(req);
    if (!email || !isEventsAdmin(email)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!isMailConfigured()) {
      return NextResponse.json({ error: "Email is not configured on the server." }, { status: 503 });
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`events-announce:${email}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Announcement limit reached. Please wait before sending again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
    const linkUrl = typeof body.linkUrl === "string" ? body.linkUrl.trim().slice(0, 500) : "";

    if (!title || !message || !linkUrl) {
      return NextResponse.json(
        { error: "Please provide title, message, and link URL." },
        { status: 400 }
      );
    }
    try {
      const u = new URL(linkUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        return NextResponse.json({ error: "Link must be an http(s) URL." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Link URL is not valid." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const snap = await adminDb
      .collection(LAF_EVENT_MEMBERS_COLLECTION)
      .where("notifyNewEvents", "==", true)
      .get();

    const recipients = snap.docs
      .map((d) => {
        const e = d.data().email;
        return typeof e === "string" ? e.trim().toLowerCase() : "";
      })
      .filter((e) => e.includes("@"));

    const unique = [...new Set(recipients)].slice(0, MAX_RECIPIENTS_PER_RUN);

    let sent = 0;
    let failed = 0;
    for (const to of unique) {
      const ok = await sendNewEventAnnouncementEmail({ to, title, message, linkUrl });
      if (ok) sent += 1;
      else failed += 1;
    }

    await adminDb.collection("laf_event_announcements").add({
      title,
      message,
      linkUrl,
      sentBy: email,
      recipientCount: unique.length,
      sent,
      failed,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      ok: true,
      recipientCount: unique.length,
      sent,
      failed,
    });
  } catch (err) {
    console.error("[events/announce]", err);
    return NextResponse.json({ error: "Could not send announcements." }, { status: 500 });
  }
}
