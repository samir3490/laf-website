const BLOCKED_DOMAINS = [
  "pornhub.com",
  "xvideos.com",
  "xhamster.com",
  "onlyfans.com",
  "bet365.com",
  "1xbet.com",
  "stake.com",
  "coinbase-scam.com",
];

const BLOCKED_KEYWORDS = [
  "casino",
  "porn",
  "xxx",
  "adult content",
  "betting",
  "gambling",
  "crypto airdrop",
  "get rich quick",
  "nude",
];

export type SafetyResult = {
  rejected: boolean;
  safetyScore: number;
  rejectReason: string | null;
};

export function evaluateSafety(
  url: string,
  title: string,
  description: string,
  snippet: string
): SafetyResult {
  const text = `${url} ${title} ${description} ${snippet}`.toLowerCase();

  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return { rejected: true, safetyScore: 0, rejectReason: "Invalid URL" };
  }

  for (const domain of BLOCKED_DOMAINS) {
    if (host === domain || host.endsWith(`.${domain}`)) {
      return {
        rejected: true,
        safetyScore: 0,
        rejectReason: "Blocked domain",
      };
    }
  }

  for (const keyword of BLOCKED_KEYWORDS) {
    if (text.includes(keyword)) {
      return {
        rejected: true,
        safetyScore: 10,
        rejectReason: `Blocked keyword: ${keyword}`,
      };
    }
  }

  let score = 85;
  if (host.endsWith(".edu") || host.endsWith(".gov") || host.endsWith(".gov.in")) score = 95;
  if (host.endsWith(".org")) score = Math.max(score, 88);

  return { rejected: false, safetyScore: score, rejectReason: null };
}
