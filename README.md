# Lata Agrawal Foundation Website

Next.js site for [agrawalfoundation.org](https://agrawalfoundation.org), replacing the slow WordPress install. Phase 1: deploy on Vercel first, then point the custom domain from BigRock (same flow as Agrasen Technologies).

## Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- Content exported from WordPress REST API → `src/content/*.json`

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Images (same as Agrasen Technologies)

Site images live in **`public/`** — not hotlinked from WordPress:

- `public/logo.png` — navbar logo
- `public/images/YYYY/MM/...` — page and blog images downloaded from WP uploads

After exporting content, download and rewrite paths:

```bash
npm run export:wp
npm run download:images
```

Content JSON then references local paths like `/images/2024/12/mission-ngo-lata.webp`.

## Community Scratch Games

Route: `/community-scratch-games` — public gallery of MIT Scratch embeds; signed-in users can publish, edit, and delete their own games (Firebase Auth + Firestore, project **`lata-agrawal-foundation`** — same as 80G Receipts, Donor Transparency, Social Media Hub).

**Vercel environment variables** — copy all `NEXT_PUBLIC_FIREBASE_*` values from `.env.example` (LAF Website web app: `8de8c027a5fe7bd46107ad`).

Enable **Email/Password** in Firebase Console → Authentication (`lata-agrawal-foundation`). Deploy Firestore rules:

```bash
cd firebase-laf
firebase use lata-agrawal-foundation
firebase deploy --only firestore:rules
```

## Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) → add property `https://www.agrawalfoundation.org`
2. Choose **HTML tag** verification → copy the `content="..."` value (not the whole meta tag)
3. Vercel → **Environment Variables** → `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = that value → redeploy
4. Back in GSC → **Verify** → then **Sitemaps** → submit `https://www.agrawalfoundation.org/sitemap.xml`

## Deploy to Vercel

1. Push this folder to GitHub (or import directly in Vercel).
2. In [Vercel Dashboard](https://vercel.com) → **Add New Project** → import `laf-website`.
3. Framework preset: **Next.js** (auto-detected). Root directory: `laf-website` if the repo is the parent folder.
4. Add Firebase env vars above for Scratch Games.
4. Click **Deploy**. You will get a URL like `laf-website-xxx.vercel.app`.

## Custom domain (later — BigRock DNS)

When ready to switch from WordPress hosting to Vercel:

### In Vercel

1. Project → **Settings** → **Domains**
2. Add `agrawalfoundation.org` and `www.agrawalfoundation.org`
3. Vercel shows the DNS records you need (usually **A** record `76.76.21.21` for apex, **CNAME** `cname.vercel-dns.com` for www)

### In BigRock

1. Log in to BigRock → **DNS Management** for `agrawalfoundation.org`
2. Update or add:
   - **A** record for `@` → Vercel IP (e.g. `76.76.21.21`)
   - **CNAME** for `www` → `cname.vercel-dns.com`
3. Remove or lower TTL on old WordPress A records after the new site is verified
4. Wait for DNS propagation (up to 24–48 hours)

SSL is issued automatically by Vercel once DNS resolves.

## Pages included (Phase 1)

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/about` | About Us |
| `/donate` | Razorpay button + bank details + QR |
| `/contact` | Contact |
| `/volunteer` | Volunteer |
| `/csr` | CSR for companies |
| `/faq` | FAQs |
| `/blog` | Blog listing (92 posts exported) |
| `/ways-to-help` | Ways to help |

Old WordPress URLs redirect via `next.config.ts` (e.g. `/donate-now` → `/donate`).

## Environment variables

Optional — Razorpay button ID defaults to `pl_PetTf2rANXljZC` in `src/content/site.json`:

```
NEXT_PUBLIC_RAZORPAY_BUTTON_ID=pl_PetTf2rANXljZC
```
