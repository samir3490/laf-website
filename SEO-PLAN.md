# LAF Website — SEO Plan

**Site:** https://www.agrawalfoundation.org  
**Platform:** Next.js on Vercel  
**Last updated:** October 2026  
**Goal:** Grow organic traffic for children's education NGO keywords (Wardha, Maharashtra, India): donate, volunteer, learning library, Young Innovators, drawing competition, CSR.

**Live audit (Oct 2026):** see canvas [laf-seo-audit.canvas.tsx](/Users/samir/.cursor/projects/c-Users-samir-OneDrive-Documents-Cursor-AI/canvases/laf-seo-audit.canvas.tsx) — technical base is solid; next wins are Event schema, Google recrawl of `/events`, Drawing OG image, CWV, and real Wardha content.

---

## How to use this document

- Check off items: `- [ ]` → `- [x]`
- **Interactive checklist:** open [laf-seo-checklist.canvas.tsx](/Users/samir/.cursor/projects/c-Users-samir-OneDrive-Documents-Cursor-AI/canvases/laf-seo-checklist.canvas.tsx) beside this chat (click remaining items to mark done; state persists).
- **Priority:** P0 = do first, P1 = high impact, P2 = ongoing, P3 = nice to have

---

## Current baseline (June 2026)

| Area | Status |
|------|--------|
| HTTPS / SSL | ✅ Vercel |
| `robots.txt` + sitemap | ✅ Dynamic |
| Canonical URLs + OG/Twitter | ✅ `pageMetadata()` |
| JSON-LD (NGO, WebSite, Article, FAQ, Library) | ✅ Most pages |
| Google Search Console | ✅ Submitted |
| GA4 + conversion events | ✅ |
| Blog posts | ✅ 2 real impact stories + weekly scheduled posts (Articly duplicates removed) |
| Core Web Vitals (Home/Blog perf) | ⚠️ ~63–65 — improve images |
| Weekly blog automation | ✅ GitHub Action (see `BLOG-AUTOMATION.md`) |

---

## Target keywords (primary)

| Cluster | Example queries | Landing pages |
|---------|-----------------|---------------|
| NGO / donate | donate to children education India, NGO Wardha | `/donate`, `/about`, `/csr` |
| Volunteer | volunteer NGO Maharashtra, teach children Wardha | `/volunteer`, `/ways-to-help` |
| Education | free learning resources India, student library | `/library` |
| Events | young innovators challenge, drawing competition children India | `/events/young-innovators`, `/events/drawing-competition` |
| Local | Lata Agrawal Foundation, NGO Sewashram Wardha | `/about`, `/contact`, blog impact stories |

---

## Phase 1 — Technical SEO

### Crawling & indexing

- [x] **P0** `robots.txt` — allow `/`, block `/admin`
- [x] **P0** Dynamic `sitemap.xml` — static routes + blog + library
- [x] **P0** `metadataBase` + canonical on every page
- [x] **P0** Legacy WordPress URL 301 redirects (`next.config.ts`, middleware)
- [x] **P1** Submit sitemap in Google Search Console
- [ ] **P1** Submit sitemap in Bing Webmaster Tools
- [ ] **P2** Google Business Profile for Wardha address — [profile link](https://share.google/sS7t8AqELTr8J5fXS) added to Contact page; verify in Search Console
- [x] **P1** Blog pagination canonical URLs (`?page=N`)

### Structured data

- [x] **P0** `Organization` / `NGO` JSON-LD (layout)
- [x] **P0** `WebSite` JSON-LD (home)
- [x] **P1** `Article` JSON-LD on blog posts (with image + publisher logo)
- [x] **P1** `FAQPage`, `ContactPage`, `LearningResource`, `BreadcrumbList`
- [x] **P0** `Event` schema for Young Innovators Challenge 2026
- [x] **P2** `Event` schema for drawing competition dates
- [x] **P1** Young Innovators Open Graph / Twitter share image
- [x] **P1** Drawing competition dedicated OG image
- [x] **P2** Admin page absolute titles (no duplicate site name)
- [x] **P2** Events hub footer copy (no “more competitions coming” under live events)
- [ ] **P0** Request Google re-index of `/events` and `/events/young-innovators` (Search still shows stale Drawing-only snippets)

### Performance

- [ ] **P1** Re-run Lighthouse — target Performance > 80 on Home and Blog
- [ ] **P1** Compress large blog/hero images (WebP where possible)
- [x] **P2** Lazy-load below-fold blog card images
- [ ] **P2** Review third-party script weight (GA, Ads, Firebase client)

---

## Phase 2 — On-page SEO

### Homepage

- [x] **P0** Title + meta description with NGO + Wardha keywords
- [x] **P1** Drawing competition promo section with internal links
- [x] **P1** “Latest impact stories” linking to `/blog`
- [ ] **P2** Add FAQ snippet or trust stats with schema

### Key landing pages

- [ ] **P1** Audit `/donate`, `/volunteer`, `/about` H1/H2 keyword alignment
- [x] **P1** Events hub links to drawing competition + submit
- [x] **P1** Library cross-linked from footer/nav

### Blog

- [x] **P0** Featured image alt text = post title
- [x] **P1** Internal link footer on posts (donate, volunteer, library, events)
- [x] **P1** Bulk SEO pass on `posts.json` (`npm run seo:blog`)
- [x] **P0** Reduce duplicate/thin Articly posts (90 removed Jun 2026 — kept 2 Wardha camp stories)
- [x] **P1** Related posts on article pages
- [ ] **P2** Topic clusters: education, nutrition, Wardha impact, volunteering

---

## Phase 3 — Content & publishing

- [x] **P0** Weekly scheduled blog pipeline (GitHub Actions)
- [ ] **P1** One high-quality Wardha impact story per month (real photos)
- [ ] **P1** Stop low-quality AI duplicate posts (Articly weekly spam)
- [ ] **P2** Link new blog posts to library resources and events
- [ ] **P2** Email/social share when weekly post publishes

---

## Phase 4 — Off-page & monitoring

- [ ] **P1** Monitor GSC: impressions, clicks, coverage errors (monthly)
- [ ] **P2** Backlinks from partner NGOs, CSR pages, local directories
- [ ] **P2** Google Ad Grants optimization (if applicable)
- [ ] **P3** Bing / DuckDuckGo indexing check

---

## Scripts reference

| Command | Purpose |
|---------|---------|
| `npm run seo:blog` | Internal links + strip Articly junk in all posts |
| `npm run remove:articly-posts` | Remove duplicate posts (same title/content), not all Articly posts |
| `npm run rewrite:blog-posts` | Regenerate NGO-focused article HTML (keeps slug, date, URL) |
| `npm run clean:blog-posts -- --all` | Rewrite intros / known bad posts |
| `npm run publish:blog` | Move due scheduled posts → live (local test) |
| `npm run export:wp` | Pull from WordPress (legacy) |

See **BLOG-AUTOMATION.md** for weekly publishing workflow.

---

## Blog quality audit (June 2026)

| Category | Count | Action |
|----------|-------|--------|
| Live blog posts | **87** | Original Articly/WP export content restored (5 exact duplicates removed) |
| Real LAF event stories (Sewashram Wardha) | **2** | Original dental & eye camp content preserved |
| Scheduled weekly posts | 4 queued | See `scheduled-posts.json` + GitHub Action |
