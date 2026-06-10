# Lata Agrawal Foundation — Site Improvement Plan

Track progress here while giving instructions in chat. Check items off as they complete.

## DNS & launch

- [x] New Next.js site on Vercel (`laf-website.vercel.app`)
- [x] HubSpot contact + volunteer forms
- [x] Razorpay donate page
- [ ] DNS fully propagated — `agrawalfoundation.org` shows new site
- [ ] Confirm Google email still works after DNS change (send/receive test)
- [ ] Submit sitemap in Google Search Console
- [ ] Cancel BigRock WordPress hosting (after 1–2 weeks stable)

## Branding & layout

- [x] New square logo (`public/logo-square.png`)
- [x] Wider page container (less side whitespace)
- [x] Navbar logo sizing + contrast on dark header
- [ ] Optional: horizontal logo variant for mobile (if square feels too tall)
- [ ] Footer logo update to match new brand

## Page polish

- [x] Volunteer page — two-column layout (content + HubSpot form)
- [ ] Contact page — match volunteer two-column style
- [ ] About page — impact grid styling on new width
- [ ] Donate page — layout pass on wide screens
- [ ] Home hero — balance images on ultra-wide monitors
- [ ] CSR / FAQ / Ways to help — content review

## Blog

- [x] Strip articly.ai junk from post HTML
- [x] Blog post typography (TOC, headings, images)
- [x] SEO metadata per post (description, canonical, Open Graph)
- [x] JSON-LD Article schema on blog posts
- [ ] Review top 10 posts manually for accuracy / tone
- [ ] Add featured images where missing (many use Unsplash hotlinks)
- [ ] Pagination or “load more” if listing all 92 posts
- [ ] Internal links to /donate and /volunteer in key posts

## SEO

- [x] `sitemap.xml` + `robots.txt`
- [x] `metadataBase` + canonical URLs
- [x] Organization JSON-LD on all pages
- [x] Google Ads tag (`AW-17149139381`) from old site
- [ ] Google Search Console verification (if you have meta tag, share it)
- [ ] Rank Math redirects audit — any high-traffic URLs still 404?
- [ ] Local SEO: address/phone schema on Contact page
- [ ] Social preview image (`og:image`) — create 1200×630 banner

## Features not yet migrated

- [ ] Community Scratch Games (`/community-scratch-games`)
- [ ] Photo gallery (`/gallery`)
- [ ] Google Reviews QR / testimonial page
- [ ] Donor dashboard (if still needed)

## Performance

- [ ] Lighthouse audit on Home, Donate, Blog
- [ ] Confirm all images served from `/public/images` (no broken WP links)
- [ ] HubSpot + gtag load `afterInteractive` only

---

**Current focus (in progress):** branding, layout width, volunteer page, blog cleanup, SEO foundations.

**Live preview:** https://laf-website.vercel.app  
**After DNS:** https://www.agrawalfoundation.org
