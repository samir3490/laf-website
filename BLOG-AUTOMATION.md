# LAF Weekly Blog Publishing

Automated publishing works like [Agrasen Technologies](https://github.com/samir3490/agrasen-technologies): posts are **pre-written**, scheduled by date, and published by GitHub Actions when the date arrives.

## How it works

1. **Draft posts** are stored in `src/content/scheduled-posts.json` (not visible on the site yet).
2. **Every Monday at 9:00 AM UTC**, `.github/workflows/publish-blog.yml` runs `scripts/publish-scheduled-blog.mjs`.
3. Posts whose `date` is **today or earlier** are moved into `src/content/posts.json` and deployed on the next Vercel build.

## Add a new weekly post

Edit `src/content/scheduled-posts.json` and append an object:

```json
{
  "slug": "your-url-slug-here",
  "title": "Post title for SEO",
  "date": "2026-07-14",
  "featuredImage": "/images/events/drawing-competition-promo.png",
  "excerpt": "155-character summary with keywords: LAF, Wardha, children education…",
  "html": "<div class='post_open'><p>Opening paragraph…</p></div><h2>Section</h2><p>Body with <a href=\"/donate\">internal links</a>.</p>"
}
```

### Image guidelines

- Use images already in `public/images/` (or add new ones under `public/images/blog/`).
- Recommended size: **1200×630** or **16:9** for featured images.
- Set `featuredImage` explicitly — do not rely on first `<img>` in HTML.

### SEO checklist for each post

- Title includes primary keyword (e.g. “children education Wardha”, “volunteer NGO India”).
- Excerpt under 160 characters.
- 2–4 internal links: `/donate`, `/volunteer`, `/library`, `/events/drawing-competition`, `/about`.
- Run `npm run seo:blog` after bulk edits to append the standard footer block.

## Test locally

```bash
node scripts/publish-scheduled-blog.mjs
npm run build
```

## Manual publish trigger

GitHub → Actions → **Publish scheduled LAF blog posts** → **Run workflow**.

## Content quality

Prefer **one factual impact story per month** (Wardha camps, school visits) over duplicate AI articles. The legacy Articly posts are being cleaned with `npm run seo:blog` and `npm run clean:blog-posts -- --all`.

See **SEO-PLAN.md** for the full SEO roadmap.
