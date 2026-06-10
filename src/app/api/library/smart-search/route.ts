import { NextResponse } from "next/server";
import { parseSmartSearch } from "@/lib/library-smart-search";

const rateMap = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = rateMap.get(ip) ?? 0;
    if (count >= 20) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }
    rateMap.set(ip, count + 1);

    const body = await req.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (question.length < 4) {
      return NextResponse.json({ error: "Please enter a longer question." }, { status: 400 });
    }
    if (question.length > 200) {
      return NextResponse.json({ error: "Question is too long." }, { status: 400 });
    }

    const result = await parseSmartSearch(question);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not process your question." }, { status: 500 });
  }
}
