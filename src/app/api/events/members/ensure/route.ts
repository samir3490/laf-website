import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { sendEventMemberWelcomeEmail } from "@/lib/event-members-notify";
import { LAF_EVENT_MEMBERS_COLLECTION } from "@/lib/event-members";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin-auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const decoded = await verifyFirebaseIdToken(req);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`events-member-ensure:${ip}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const displayName =
      (typeof body.displayName === "string" && body.displayName.trim()) ||
      decoded.name ||
      null;
    const email = decoded.email.trim().toLowerCase();
    const provider =
      (decoded.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider ?? null;

    const ref = adminDb.collection(LAF_EVENT_MEMBERS_COLLECTION).doc(decoded.uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        email,
        displayName,
        notifyNewEvents: true,
        provider,
        welcomeSentAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const welcomeSent = await sendEventMemberWelcomeEmail(email, displayName);
      if (welcomeSent) {
        await ref.update({
          welcomeSentAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return NextResponse.json({
        ok: true,
        created: true,
        notifyNewEvents: true,
        welcomeSent,
      });
    }

    const data = snap.data()!;
    const updates: Record<string, unknown> = {
      email,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (displayName && !data.displayName) updates.displayName = displayName;
    if (provider && !data.provider) updates.provider = provider;

    let welcomeSent = false;
    if (!data.welcomeSentAt) {
      welcomeSent = await sendEventMemberWelcomeEmail(
        email,
        (typeof data.displayName === "string" && data.displayName) || displayName
      );
      if (welcomeSent) updates.welcomeSentAt = FieldValue.serverTimestamp();
    }

    await ref.update(updates);

    return NextResponse.json({
      ok: true,
      created: false,
      notifyNewEvents: data.notifyNewEvents !== false,
      welcomeSent,
    });
  } catch (err) {
    console.error("[events/members/ensure]", err);
    return NextResponse.json({ error: "Could not save your profile." }, { status: 500 });
  }
}
