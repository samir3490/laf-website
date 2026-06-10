# Lata Agrawal Foundation — Site Improvement Plan

Track progress here while giving instructions in chat. Check items off as they complete.

## DNS & launch

- [x] New Next.js site on Vercel (`laf-website.vercel.app`)
- [x] HubSpot contact + volunteer forms
- [x] Razorpay donate page
- [x] DNS fully propagated — `agrawalfoundation.org` shows new site
- [ ] Confirm Google email still works after DNS change (send/receive test)
- [x] Submit sitemap in Google Search Console (`/sitemap.xml` — see SEO section)
- [ ] Cancel BigRock WordPress hosting (after 1–2 weeks stable)

## Branding & layout

- [x] New square logo (`public/logo-square.png`)
- [x] Wider page container (less side whitespace)
- [x] Navbar logo sizing + contrast on dark header
- [ ] Optional: horizontal logo variant for mobile (if square feels too tall)
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
- [ ] Review top 10 posts manually for accuracy / tone
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
  - [ ] Migrate existing WordPress-published games to Firestore (if any)
  - [x] Add Firebase env vars in Vercel production (`lata-agrawal-foundation` — LAF Website web app)
  - [x] Deploy Firestore rules (`firebase-laf` → `lata-agrawal-foundation`)
- [ ] Photo gallery (`/gallery`)
- [ ] Google Reviews QR / testimonial page
- [ ] Donor dashboard (if still needed)

## Performance

- [ ] Lighthouse audit on Home, Donate, Blog (Home: Perf 63, SEO 92, A11y 96 — Jun 2026)
- [x] Confirm all images served from `/public/images` (no broken WP links)
- [ ] HubSpot + gtag load `afterInteractive` only

---

**Current focus (in progress):** Email test (Google Workspace), Lighthouse audit, cancel WP hosting after 2 weeks stable.

**Live site:** https://www.agrawalfoundation.org  
**Vercel preview:** https://laf-website.vercel.app
