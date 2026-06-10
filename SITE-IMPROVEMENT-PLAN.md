# Lata Agrawal Foundation — Site Improvement Plan

Track progress here while giving instructions in chat. Check items off as they complete.

## DNS & launch

- [x] New Next.js site on Vercel (`laf-website.vercel.app`)
- [x] HubSpot contact + volunteer forms
- [x] Razorpay donate page
- [x] DNS fully propagated — `agrawalfoundation.org` shows new site
- [x] Confirm Google email still works after DNS change (send/receive test)
- [x] Submit sitemap in Google Search Console (`/sitemap.xml` — see SEO section)
- [x] BigRock WordPress hosting — **keeping** (not cancelling; WP remains available as backup)

## Branding & layout

- [x] New square logo (`public/logo-square.png`)
- [x] Wider page container (less side whitespace)
- [x] Navbar logo sizing + contrast on dark header
- [x] Horizontal logo in navbar and footer (`logo.png` — gold emblem + navy wordmark, larger on desktop)
- [ ] Playful learning theme — **preview only** at `/preview/learning-theme` (`?theme=playful` — warm v3; revert anytime)
- [x] Footer logo update to match new brand
- [x] Social media links (Facebook, Instagram, LinkedIn, YouTube)

## Page polish

- [x] Volunteer page — two-column layout (content + HubSpot form)
- [x] Contact page — match volunteer two-column style
- [x] About page — impact grid styling on new width
- [x] Donate page — layout pass on wide screens
- [x] Home hero — balance images on ultra-wide monitors
- [x] CSR / FAQ / Ways to help — content review

## Blog

- [x] Strip articly.ai junk from post HTML
- [x] Blog post typography (TOC, headings, images)
- [x] SEO metadata per post (description, canonical, Open Graph)
- [x] JSON-LD Article schema on blog posts
- [x] Review top 10 posts manually for accuracy / tone (Jun 2026 — rewrote 3 AI-hallucinated posts; LAF intro on all 10 recent)
- [x] Blog cleanup pass on remaining 82 posts (LAF intros, 3 more full rewrites; preserved real photo posts)
- [x] Add featured images where missing (many use Unsplash hotlinks)
- [x] Pagination or “load more” if listing all 92 posts
- [x] Internal links to /donate and /volunteer in key posts

## SEO

- [x] `sitemap.xml` + `robots.txt`
- [x] `metadataBase` + canonical URLs
- [x] Organization JSON-LD on all pages
- [x] Google Ads tag (`AW-17149139381`) from old site
- [x] Google Search Console — property already added (clicks/impressions showing)
- [x] Submit sitemap in GSC: `https://www.agrawalfoundation.org/sitemap.xml`
- [x] Rank Math redirects audit — legacy blog URLs → `/blog/[slug]` middleware + page redirects
- [x] Local SEO: address/phone schema on Contact page
- [x] Social preview image (`og:image`) — create 1200×630 banner

## Features not yet migrated

- [x] Community Scratch Games (`/community-scratch-games`)
  - [x] Public gallery — browse and play without login
  - [x] Sign up / sign in (Firebase Auth, email + password)
  - [x] Publish Scratch project link — auto-embeds on public gallery
  - [x] Copy embed code for own sites
  - [x] Edit / delete own games only
  - [x] Migrate existing WordPress-published games to Firestore — none in WP export (empty gallery; users publish via sign-in)
  - [x] Add Firebase env vars in Vercel production (`lata-agrawal-foundation` — LAF Website web app)
  - [x] Deploy Firestore rules (`firebase-laf` → `lata-agrawal-foundation`)
- [x] Photo gallery (`/gallery`)
- [x] Google Reviews page (`/reviews` — Maps embed, single QR, public metadata sync, nav link)
- [x] Donor dashboard — live at [portal.agrawalfoundation.org](https://portal.agrawalfoundation.org) (linked from site footer)
- [x] **Learning Resource Library** — see [`LAF-LEARNING-RESOURCE-LIBRARY-PLAN.md`](./LAF-LEARNING-RESOURCE-LIBRARY-PLAN.md)
  - [x] Phase 0: Seed 58 resources, browse + search at `/library`
  - [x] Phase 1 (core): Submit at `/library/submit`, admin at `/admin/library`, robotics page, report + clicks
  - [x] Phase 1 follow-up: Gemini API key configured
  - [x] Phase 2 (core): Detail pages, scholarships/volunteer modules, search analytics, dead-link checks
  - [x] Phase 2 follow-up: Firestore rules + seed import verified; `CRON_SECRET` on Vercel
  - [x] Phase 3 (core): Learning paths + AI “Ask the library” smart search
  - [x] Phase 3 follow-up: Wide sidebar layout, Gemini JSON fix, `/library/ngo` module
  - [x] Phase 3 optional (partial): Top contributors, monthly metadata refresh cron, Turnstile captcha, notify flag on submit
  - [x] Phase 3 env setup: `FIREBASE_SERVICE_ACCOUNT_JSON`, Turnstile keys on Vercel
  - [x] Phase 3 optional: Automated approval emails (when submitter opts in + GMAIL_* on Vercel)
  - [x] Admin email on new library submission (`/api/library/notify-submission`)
  - [x] Gmail on Vercel (same credentials as donor portal — configured Jun 2026)
  - [ ] Phase 3 optional: Gamification — deferred until submission volume grows

## Performance

- [x] Lighthouse audit on Home, Donate, Blog (Jun 2026 baseline)
  - Home: Perf 63, SEO 92, A11y 96
  - Donate: Perf 86, SEO 100
  - Blog: Perf 65, SEO 100
- [x] Confirm all images served from `/public/images` (no broken WP links)
- [x] HubSpot + gtag load `afterInteractive` only (gtag via `Analytics.tsx`; HubSpot async on contact/volunteer only)
- [x] Home hero — lighter WebP background + tuned image sizes (Jun 2026)
- [ ] Re-run Lighthouse after deploy and note updated scores

---

**Current focus:** Site is feature-complete for launch. Ongoing: review library submissions, monitor GSC, optional gamification later.

**Live site:** https://www.agrawalfoundation.org  
**Vercel preview:** https://laf-website.vercel.app
