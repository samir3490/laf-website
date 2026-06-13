import { NextResponse } from "next/server";
import { driveThumbnailUrl } from "@/lib/drawing-image";

export async function GET(req: Request) {
  const fileId = new URL(req.url).searchParams.get("fileId")?.trim();
  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: "Invalid file id." }, { status: 400 });
  }

  try {
    const upstream = await fetch(driveThumbnailUrl(fileId), {
      headers: { "User-Agent": "LAF-Drawing-Gallery/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      const fallback = await fetch(
        `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      if (!fallback.ok) {
        return NextResponse.json({ error: "Image unavailable." }, { status: 502 });
      }
      const fbBuffer = await fallback.arrayBuffer();
      const fbType = fallback.headers.get("content-type") ?? "image/jpeg";
      return new NextResponse(fbBuffer, {
        headers: {
          "Content-Type": fbType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    const buffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[drawing/image]", err);
    return NextResponse.json({ error: "Image fetch failed." }, { status: 502 });
  }
}
