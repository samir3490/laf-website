import dns from "node:dns/promises";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
  "kubernetes.default.svc",
]);

function parseIpv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = parseIpv4(ip);
  if (!parts) return false;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateOrReservedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  return false;
}

function isPrivateOrReservedIp(ip: string): boolean {
  if (ip.includes(":")) return isPrivateOrReservedIpv6(ip);
  return isPrivateOrReservedIpv4(ip);
}

async function resolveHostAddresses(hostname: string): Promise<string[]> {
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(lower)) {
    throw new Error("Blocked hostname.");
  }

  if (isPrivateOrReservedIp(lower)) {
    throw new Error("Blocked IP address.");
  }

  const addresses: string[] = [];

  try {
    addresses.push(...(await dns.resolve4(lower)));
  } catch {
    // no A records
  }

  try {
    addresses.push(...(await dns.resolve6(lower)));
  } catch {
    // no AAAA records
  }

  if (addresses.length === 0) {
    throw new Error("Could not resolve hostname.");
  }

  for (const ip of addresses) {
    if (isPrivateOrReservedIp(ip)) {
      throw new Error("Hostname resolves to a private or reserved address.");
    }
  }

  return addresses;
}

/** Reject URLs that could target internal networks (SSRF mitigation). */
export async function assertSafeFetchUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are allowed.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs with credentials are not allowed.");
  }

  await resolveHostAddresses(parsed.hostname);
  return parsed;
}

export async function safeFetch(
  rawUrl: string,
  init?: RequestInit & { maxRedirects?: number }
): Promise<Response> {
  const maxRedirects = init?.maxRedirects ?? 5;
  let current = (await assertSafeFetchUrl(rawUrl)).toString();
  const { maxRedirects: _ignored, ...fetchInit } = init ?? {};

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const res = await fetch(current, { ...fetchInit, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location || hop === maxRedirects) {
        throw new Error("Too many redirects.");
      }
      const next = new URL(location, current).toString();
      await assertSafeFetchUrl(next);
      current = next;
      continue;
    }
    return res;
  }

  throw new Error("Too many redirects.");
}
