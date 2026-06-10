import { safeFetch } from "@/lib/safe-fetch-url";

export async function checkLibraryUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await safeFetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "LAF-Library-LinkChecker/1.0",
        Range: "bytes=0-0",
      },
      signal: AbortSignal.timeout(12000),
    });
    return { ok: res.ok || res.status === 206, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
