# LAF Learning Resource Library — Implementation Plan

**Status:** Phase 3 shipped (learning paths, smart search); Phases 0–2 complete  
**Last updated:** June 2026  
**Stack:** Next.js 16 (Vercel) · Firestore (`lata-agrawal-foundation`) · Firebase Auth · AI via server API only

---

## Vision (refined)

Build a **community-suggested, human-approved** educational resource directory for children, volunteers, teachers, parents, and NGOs.

**North star:** Become a trusted free learning directory for India — curated by community, organized by AI, **safe for children**.

**What makes this different from a link blog:**
- Structured metadata (age, difficulty, cost, language, safety)
- Duplicate detection and safety filtering
- Search and filters that actually work for students
- Optional learning paths later (Scratch → Tinkercad → Arduino…)

---

## Honest scope review — what to keep, trim, or defer

Your PRD is strong. Below is what we recommend for a **smooth, low-maintenance** build.

### Keep (high value, manageable risk)

| Item | Why |
|------|-----|
| Public URL submission | Core community feature |
| Limited crawl (homepage + metadata only) | Your upgrade — keeps cost and legal risk low |
| Cache AI analysis by normalized URL | Your upgrade — never pay twice for same site |
| AI category + metadata in one structured call | Efficient, one API call per new URL |
| Safety blocklist auto-reject | Adult, gambling, crypto scams, etc. |
| **Human admin approve** before publish | Non-negotiable for child-facing content |
| Public resource cards + filters | Students need browse/search without chat |
| Report Resource button | Your upgrade — community safety net |
| Click + search tracking (simple counters) | Your upgrade — proves value, guides curation |
| Single unified `resources` collection | Simpler than 11 collections |

### Trim or simplify (good ideas, wrong for v1)

| PRD item | Recommendation | Reason |
|----------|----------------|--------|
| **AI reviews and approves submissions** | **AI recommends; admin approves** | Auto-approve will eventually publish unsafe or low-quality links. One bad link on a children’s NGO site is a serious reputational risk. |
| **11 Firestore collections** (`scholarships`, `ngo_resources`, `robotics_resources`, etc.) | **One `resources` collection** + `categories[]` + optional `module` field | Same data model powers all “libraries.” Module pages are filtered views, not separate databases. |
| **5 separate library modules at launch** | **One library + 2–3 curated landing pages** (General, Robotics, Scholarships) | Launch with General + Robotics (fits Scratch Games audience). Add NGO/Volunteer modules when you have 20+ resources each. |
| **Quality Score 1–5 + Trust 1–100 + Safety 1–100 + Educational 1–100** | **Keep Safety + Educational (0–100)**; drop star rating in v1 | Four scores confuse users and admins. Two scores + clear labels are enough. |
| **AI Search Assistant (natural language)** | **Phase 3** — start with keyword search + filters | Chat search needs ongoing prompt tuning and costs more per query. Filters solve 80% of “I’m 10 and want free coding.” |
| **Gamification (points, badges, top contributors)** | **Phase 3** | Fun but needs anti-spam rules, profile pages, and moderation load. |
| **Auto-generated learning pathways** | **Phase 3** (your note: build later) | Agree. Manually curate 3–5 paths first (Robotics, Coding, English). |
| **Monthly AI quality review cron** | **Phase 3** | Start with “Report Resource” + quarterly manual review. |
| **Dead link detection** | **Phase 2** — weekly HEAD request job | Simple cron; don’t block MVP. |
| **Scholarship deadline AI extraction** | **Phase 2 with manual fields** | Deadlines wrong = angry users. AI suggests; admin confirms. |

### Too much for v1 (defer unless you have dedicated dev time)

- Merge duplicate UI (backend dedup in v1 is enough)
- Bookmark + share (share = copy link in v1; bookmarks need auth)
- `search_logs` as full analytics product — start with aggregated counters
- “India’s largest” as a **technical** goal — fine as marketing; technically aim for **500 quality resources** first

---

## Recommended architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Public site (Next.js on Vercel)                            │
│  /library          Browse, search, filters                  │
│  /library/submit   URL form (+ Turnstile captcha)           │
│  /library/[slug]   Resource detail                          │
│  /library/robotics Curated module view (filtered)           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  API routes (server-only, secrets never in browser)         │
│  POST /api/library/submit     → validate URL, dedup, queue  │
│  POST /api/library/analyze    → fetch meta + AI (internal)  │
│  POST /api/library/report     → flag resource               │
│  POST /api/library/click      → increment visit counter     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Firestore (lata-agrawal-foundation)                        │
│  library_submissions   Pending pipeline                     │
│  library_resources     Approved public catalog              │
│  library_reports       User flags                           │
│  library_analytics     Daily aggregates (optional)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Admin (Firebase Auth — admin@agrawalfoundation.org)        │
│  /admin/library          Pending queue, approve/reject/edit   │
└─────────────────────────────────────────────────────────────┘
```

**Reuse existing patterns:** Same Firebase project and admin email check as Scratch Games and `firebase-laf/firestore.rules`.

**AI provider:** Google Gemini (fits Firebase/Google stack; good structured JSON). Alternative: OpenAI. One env var `LIBRARY_AI_API_KEY` on Vercel.

---

## AI pipeline (cost-safe)

### Step 1 — Normalize URL
- Lowercase host, strip `utm_*`, trailing slash, default `https`
- Check `library_resources` and `library_submissions` for existing normalized URL → reject duplicate immediately

### Step 2 — Fetch (limited crawl)
**Only:**
- HTTP GET homepage (max 15s timeout, max 500 KB body)
- Parse: `<title>`, meta description, og:title, og:description, og:image, favicon link
- Extract visible text from first ~2,000 characters of body (strip scripts/styles)

**Do not:** Crawl subpages, run headless browser, or download files.

### Step 3 — Safety pre-filter (no AI)
Block if URL/domain matches blocklist OR page text matches keywords (adult, casino, crypto pump, etc.) → `status: rejected`, notify admin.

### Step 4 — Single AI call (structured JSON)
Input: title, description, snippet, URL domain.  
Output:

```json
{
  "categories": ["Coding", "Education"],
  "ageGroups": ["8-12", "13-18"],
  "difficulty": "Beginner",
  "cost": "Free",
  "languages": ["English"],
  "safetyScore": 92,
  "educationalScore": 88,
  "summary": "2-3 sentence student-friendly description",
  "reject": false,
  "rejectReason": null
}
```

If `reject: true` OR `safetyScore < 70` → auto-reject, admin can override.

### Step 5 — Human review
Admin sees: thumbnail, AI summary, scores, categories. Actions: **Approve · Reject · Edit · Merge** (merge = link submission to existing resource).

### Cache rule
Store full analysis on submission doc. On approve, copy to `library_resources`. **Never re-analyze** same normalized URL unless admin clicks “Re-analyze.”

**Estimated cost:** ~₹2–8 per new URL (one small AI call). 100 submissions/month ≈ negligible if dedup works.

---

## Firestore schema (simplified)

### `library_submissions/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `url` | string | Original |
| `urlNormalized` | string | Dedup key |
| `status` | string | `pending` \| `approved` \| `rejected` \| `duplicate` |
| `title`, `description`, `ogImage`, `favicon` | string | From fetch |
| `categories` | string[] | From AI |
| `ageGroups` | string[] | `5-8`, `8-12`, `13-18`, `18+` |
| `difficulty` | string | Beginner / Intermediate / Advanced |
| `cost` | string | Free / Freemium / Paid |
| `languages` | string[] | |
| `safetyScore`, `educationalScore` | number | 0–100 |
| `aiSummary` | string | Student-friendly |
| `module` | string? | `general` \| `scholarships` \| `ngo` \| `volunteer` \| `robotics` |
| `submittedBy` | string? | uid or `anonymous` |
| `submitterEmail` | string? | optional |
| `createdAt`, `reviewedAt` | timestamp | |
| `reviewedBy` | string? | admin uid |
| `rejectReason` | string? | |

### `library_resources/{id}`

Same fields as approved submission, plus:

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | URL-safe, unique |
| `visitCount` | number | Increment on “Visit Website” |
| `reportCount` | number | |
| `publishedAt` | timestamp | |
| `featured` | boolean | For homepage/module highlights |

### `library_reports/{id}`

| Field | Type |
|-------|------|
| `resourceId` | string |
| `reason` | string | broken / inappropriate / misleading / other |
| `details` | string? |
| `createdAt` | timestamp |
| `status` | `open` \| `resolved` |

### `library_analytics/daily_{YYYY-MM-DD}` (optional, Phase 2)

Aggregates: `searches`, `topQueries[]`, `clicksByResource`, `clicksByCategory`.

**Categories (fixed list in code):**  
Education, Coding, Programming, Robotics, Mathematics, Science, English Learning, Scholarships, Career Guidance, NGO Resources, Volunteer Training, Soft Skills, AI & Technology, Competitive Exams, Entrepreneurship.

---

## Public UX (MVP)

### Submit flow
1. User enters URL → Submit  
2. Turnstile captcha (free, Vercel-friendly)  
3. “Thanks — we’re reviewing your suggestion” (no promise of instant publish)  
4. Email optional: “Notify me when approved” (Phase 2)

### Resource card
- Thumbnail (og:image or favicon fallback)
- Title + AI summary (truncated)
- Category tags, age, difficulty, cost, language
- **Visit Website** (tracks click) · **Copy link** · **Report**

### Search (v1 — no chat)
- Search box: matches title, summary, categories
- Filters: category, age, difficulty, cost, language
- Sort: Educational score (default), Most visited, Newest

### Module landing pages (curated filters)
- `/library` — all approved resources  
- `/library/robotics` — `categories` contains Robotics OR `module == robotics`  
- `/library/scholarships` — Phase 2 when scholarship fields exist  

---

## Admin dashboard (MVP)

Protected route: Firebase Auth + `isAdmin` (same as existing Firestore rules pattern).

**Pending queue table:** URL, thumbnail, categories, scores, submitted date.  
**Actions:** Approve → creates/updates `library_resources`; Reject → reason; Edit → fix categories/text before approve.

**Notifications:** Email to `admin@agrawalfoundation.org` on new pending submission (Resend or Firebase Extension — keep simple: daily digest in Phase 1, instant email Phase 2).

---

## Safety model

| Layer | Mechanism |
|-------|-----------|
| 1 | URL blocklist (domains) |
| 2 | Keyword blocklist on fetched text |
| 3 | AI safety score + hard reject if &lt; 70 |
| 4 | **Human approval required** |
| 5 | Report Resource → auto-hide if `reportCount >= 3` pending review (Phase 2) |

**Child safety policy:** No auto-publish. No user-generated descriptions on public cards (only AI summary + admin-edited text).

---

## Phased rollout

### Phase 0 — Seed content (1 week, before public submit) ✅ shipped

**Goal:** Library is useful on day one.

- [x] **58 trusted resources** in `src/content/library-resources.json`
- [x] Public page at `/library` with search + filters
- [x] Nav + footer + sitemap links
- [x] Firestore `library_resources` rules + `npm run seed:library` script
- [x] Publish Firestore rules in Firebase Console (Phase 0 `library_resources`)
- [x] Import seed to Firestore — **59 resources** verified in `library_resources` (Jun 2026)
- **Success metric:** 50 resources live, pages indexed in sitemap ✅

### Phase 1 — MVP community pipeline ✅ shipped (core)

- [x] Public submit form at `/library/submit` + API rate limit (10/day per IP)
- [ ] Turnstile captcha (deferred — optional `TURNSTILE_SECRET`)
- [x] Analyze API (`/api/library/submit`) — fetch metadata + safety filter + Gemini/heuristics
- [x] Dedup check against existing `library_resources` by `urlNormalized`
- [x] Admin review queue at `/admin/library`
- [x] Approve → public `library_resources` catalog
- [x] Resource detail pages `/library/[slug]`
- [x] Visit click tracking on “Visit Website”
- [x] Report Resource button
- [x] Firestore rules for `library_submissions` + `library_reports` — **re-publish rules** (see `firebase-laf/firestore.rules`)
- [x] Nav link (“Library”) — done in Phase 0
- [x] `/library/robotics` curated page

**Success metric:** 10 community submissions processed; 0 unsafe publishes; &lt; 5 min admin time per submission.

### Phase 2 — Discovery & scholarships ✅ shipped (core)

- [x] Search log (`library_search_events`) + admin stats (top searches, top visits, open reports)
- [x] Scholarship fields (`eligibility`, `deadline`, `ageMin`/`ageMax`) on seed data + AI/heuristics on submit
- [x] Dead link checker — weekly Vercel cron + manual “Check seed links” in admin
- [ ] Bookmarks (Firebase Auth) — deferred
- [x] `/library/scholarships`, `/library/volunteer-training`
- [x] Resource detail pages `/library/[slug]` with share + JSON-LD
- [ ] “Notify me when approved” for submitters — deferred
- [x] Re-publish Firestore rules (`library_search_events`) in Firebase Console
- [x] `CRON_SECRET` set on Vercel (not in GitHub — secrets stay in Vercel only)

**Success metric:** 200+ resources; search used 100+ times/month.

### Phase 3 — Knowledge network ✅ shipped (core)

- [x] AI Search Assistant — “Ask the library” on `/library` (Gemini or heuristics → filters)
- [x] Learning paths — 5 curated paths at `/library/paths` + “Next in path” on resource pages
- [ ] Gamification (points, badges) — deferred until submission volume grows
- [ ] Monthly metadata refresh job — deferred
- [ ] Top contributors page — deferred
- [ ] NGO Knowledge module content partnership — deferred

**Success metric:** Learning paths drive 20%+ of outbound clicks.

---

## What we will NOT build in v1

- Full conversational AI chat on the public site
- Auto-approve without human review
- Crawling entire websites or PDFs
- Separate Firestore DB per module
- Native mobile app
- User comments/reviews on resources (spam risk)

---

## Operational load (be realistic)

| Activity | Who | Effort |
|----------|-----|--------|
| Review new submissions | Admin (you) | ~2–5 min each |
| Handle reports | Admin | ~5 min each |
| Seed / feature resources | Volunteer or admin | 1–2 hrs/month |
| Monitor AI costs | Admin | 5 min/month |
| Dead links | Automated + monthly glance | Low |

**Sustainable volume:** ~20–30 submissions/week with one part-time reviewer. Above that, add a second reviewer or stricter rate limits.

---

## Technical checklist (when build starts)

- [x] Firebase vars on Vercel (LAF Website app)
- [x] `LIBRARY_AI_API_KEY` or `GEMINI_API_KEY` on Vercel (user configured)
- [ ] Optional: `TURNSTILE_SECRET` for captcha on submit form
- [x] Extend `firebase-laf/firestore.rules` for `library_*` collections — re-publish after Phase 1
- [x] Add `/library`, `/library/submit`, `/library/robotics` to sitemap and nav
- [x] JSON-LD `WebPage` on resource detail pages
- [x] JSON-LD `ItemList` on main `/library` page
- [x] Privacy policy line: “We fetch public metadata from URLs you submit”

---

## Suggested first curated lists (Phase 0 seed)

**Robotics / Coding:** Scratch, Code.org, Tinkercad, MIT App Inventor, Blockly, Arduino Project Hub  
**General learning:** Khan Academy, NCERT, SWAYAM, British Council Learn English  
**Scholarships (manual deadlines):** National Scholarship Portal, Buddy4Study (link only; verify deadlines manually)  
**Volunteer / NGO:** GuideStar India, CSR Hub resources, child safety basics (UNICEF India materials)

---

## Decision log (recommended defaults)

| Question | Decision |
|----------|----------|
| Login required to submit? | No (captcha + rate limit); optional login for bookmarks later |
| Login required to browse? | No |
| AI auto-approve? | **No** — admin always approves except auto-**reject** for safety |
| One collection or many? | **One** `library_resources` |
| When to launch public submit? | After 50 seeded resources + admin queue tested |
| Learning paths? | Phase 3; manually curate Robotics path first |

---

## Link from main site plan

Tracked under **Features not yet migrated** in `SITE-IMPROVEMENT-PLAN.md`.

---

**Try Phase 3:** https://www.agrawalfoundation.org/library — use “Ask the library” or browse Learning paths.

**Future (optional):** Gamification, monthly metadata refresh, top contributors page.
