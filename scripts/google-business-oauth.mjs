/**
 * One-time setup to obtain GOOGLE_BUSINESS_REFRESH_TOKEN for review sync.
 *
 * Prerequisites:
 *   1. Google Cloud project (same as Firebase: lata-agrawal-foundation)
 *   2. Enable "Google Business Profile API"
 *   3. OAuth consent screen (External) — add admin@agrawalfoundation.org as test user
 *   4. Create OAuth 2.0 Client ID (Desktop app or Web with redirect http://localhost:8787)
 *
 * Usage:
 *   set GOOGLE_BUSINESS_CLIENT_ID=...
 *   set GOOGLE_BUSINESS_CLIENT_SECRET=...
 *   node scripts/google-business-oauth.mjs
 *
 * Then find account + location IDs:
 *   curl -H "Authorization: Bearer ACCESS_TOKEN" \
 *     "https://mybusiness.googleapis.com/v4/accounts"
 *   curl -H "Authorization: Bearer ACCESS_TOKEN" \
 *     "https://mybusiness.googleapis.com/v4/accounts/ACCOUNT_ID/locations"
 */

import { createServer } from "node:http";
import { URL } from "node:url";

const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_BUSINESS_REDIRECT_URI ?? "http://localhost:8787/oauth2callback";
const port = Number(new URL(redirectUri).port || 8787);

if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_BUSINESS_CLIENT_ID and GOOGLE_BUSINESS_CLIENT_SECRET first.");
  process.exit(1);
}

const scope = "https://www.googleapis.com/auth/business.manage";
const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", scope);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

console.log("\n1. Open this URL in your browser (sign in as the Google Business profile owner):\n");
console.log(authUrl.toString());
console.log("\n2. Waiting for redirect on", redirectUri, "...\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", redirectUri);
  if (url.pathname !== new URL(redirectUri).pathname) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Missing code");
    return;
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Success</h1><p>Check your terminal for tokens. You can close this tab.</p>");
  server.close();

  if (!tokenRes.ok) {
    console.error("Token exchange failed:", tokens);
    process.exit(1);
  }

  console.log("\nAdd these to Vercel:\n");
  console.log("GOOGLE_BUSINESS_REFRESH_TOKEN=" + tokens.refresh_token);
  console.log("\nAccess token (for listing accounts — expires in ~1 hour):");
  console.log(tokens.access_token);
  console.log(
    "\nList accounts:\n  curl -H \"Authorization: Bearer " +
      tokens.access_token +
      "\" https://mybusiness.googleapis.com/v4/accounts"
  );
});

server.listen(port, () => {
  console.log("Listening on port", port);
});
