# SEO Audit: betteragent.dev

**Date:** 2026-06-16
**Business type:** B2B SaaS / developer tool (AI agent infrastructure for SaaS products)
**Overall SEO Health Score: 38 / 100**

Pages crawled: `/`, `/pricing`, `/demo`, `/contact`, `/privacy`, `/terms`, `/auth/sign-in`, `/auth/sign-up`, plus `docs.betteragent.dev` (Nextra docs subdomain, sub-pages: quickstart, ai-setup, cli, tools, components).

> **Note on scope:** PageSpeed Insights and CrUX field data could not be retrieved in this environment (PSI hit a rate limit, CrUX requires an API key not configured here). The Performance score below is a heuristic based on response headers and architecture, not a measured Lighthouse run — re-run `scripts/pagespeed_check.py` with a Google API key for real numbers.

## Executive Summary

The site is small (9 routes + a docs subdomain), fast-looking infrastructure-wise (Next.js prerendered, served from Vercel + Cloudflare edge cache), and the copy itself is sharp. But almost none of the standard SEO/AI-discoverability scaffolding exists yet: no sitemap, no canonical tags, no Open Graph tags, no structured data, and — most notably for a product literally selling "the agent layer" — robots.txt blocks ClaudeBot, GPTBot, Google-Extended, and other AI crawlers outright.

### Top 5 Critical Issues
1. No structured data (JSON-LD) anywhere on either domain.
2. Six distinct pages share the exact same `<title>` and meta description.
3. No `sitemap.xml` on betteragent.dev or docs.betteragent.dev (both 404).
4. robots.txt blocks GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, meta-externalagent — cutting off AI-assistant-driven discovery.
5. `/demo` is server-side empty (50 characters of text) — no indexable content, no heading, duplicate meta.

### Top 5 Quick Wins
1. Write unique titles/descriptions per page (~10 min/page, highest leverage available).
2. Add `app/sitemap.ts` and reference it in robots.txt.
3. Add Open Graph + Twitter Card tags with one branded image.
4. Add canonical tags via Next.js metadata API.
5. Add Organization + SoftwareApplication JSON-LD to the homepage (pricing data already exists to map directly into it).

---

## Technical SEO — Score: 55/100

**What works:** HTTPS + HSTS, clean URLs, robots.txt allows general search crawling (`Content-Signal: search=yes`), mobile viewport meta present, pages are Next.js-prerendered and edge-cached.

**Findings:**
- **[Critical]** No sitemap.xml on either domain — both `/sitemap.xml` paths render the site's not-found page (soft 404). No `Sitemap:` directive in either robots.txt.
- **[High]** No `<link rel="canonical">` on any of the 9 crawled pages. Matters more because the apex domain 307-redirects to `www.betteragent.dev`.
- **[High]** robots.txt explicitly disallows GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, meta-externalagent, Amazonbot, CloudflareBrowserRenderingCrawler. `Content-Signal: ai-train=no` is set globally. This looks like Cloudflare's default managed AI-bot ruleset rather than a deliberate decision — worth confirming with the team.
- **[Medium]** No CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, or Permissions-Policy headers on the homepage response.
- **[Low]** Apex→www redirect uses 307 (temporary) instead of 301/308.

## Content Quality — Score: 40/100

**What works:** Homepage copy is specific and avoids generic SaaS filler. Pricing page clearly explains the credit-based billing model with a full comparison table.

**Findings:**
- **[Critical]** `/demo` has only ~50 characters of server-rendered text (vs. 6,736 on the homepage) — a fully client-rendered empty shell with no SSR fallback, no `<h1>`, and a meta description copy-pasted from the homepage.
- **[High]** No About, team, case-study, or testimonial page anywhere in the site's link graph — no authority/E-E-A-T signal beyond the product copy itself.
- **[Medium]** No blog or long-tail educational content; `/blog` 404s. Not urgent pre-PMF, but worth flagging as a growth lever.

## On-Page SEO — Score: 30/100

**What works:** Single `<h1>` present on most pages; `lang="en"` correctly set.

**Findings:**
- **[Critical]** Identical `<title>BetterAgent — the agent layer your SaaS is missing</title>` and identical meta description served on `/`, `/pricing`, `/demo`, `/contact`, `/auth/sign-in`, and `/auth/sign-up`. Only `/privacy`, `/terms`, and the docs subdomain have unique metadata.
- **[High]** Zero Open Graph or Twitter Card tags anywhere — shared links render with no title, description, or image in Slack/X/LinkedIn.
- **[Medium]** `/demo` has no `<h1>` (same root cause as the content-quality finding).

## Schema / Structured Data — Score: 0/100

- **[High]** No `application/ld+json` block found on any of the 9 crawled pages. No Organization, SoftwareApplication, Product, or BreadcrumbList schema. The pricing comparison table on `/pricing` is a direct, low-effort candidate for Product/Offer schema.

## Performance (CWV) — Score: 65/100 *(heuristic — not lab-measured)*

**What works:** Prerendered Next.js output served via Vercel + Cloudflare edge cache (`x-vercel-cache: HIT`, `cf-cache-status`), gzip compression, HTTP/3 advertised.

**Findings:**
- **[Info]** Real Lighthouse/CrUX data unavailable this run (PSI rate-limited, CrUX needs an API key). Homepage loads 16 separate JS chunks — worth checking bundle size once real metrics are available.

## AI Search Readiness — Score: 20/100

**Findings:**
- **[Critical]** Every major AI assistant/answer-engine crawler is blocked (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, meta-externalagent). For a product whose pitch is "the agent layer your SaaS is missing," this means the product is invisible when developers ask ChatGPT/Claude/Gemini "what should I use to add an agent to my SaaS." This is almost certainly worth fixing even if `ai-train=no` is kept intentionally for IP reasons — `ai-input` access (RAG/grounding at query time) doesn't require also allowing training.
- **[Medium]** No `llms.txt` on either domain. The docs subdomain already has clean MDX-sourced content (quickstart, CLI reference, tools, components) — cheap to point an llms.txt at it.

## Images — Score: 50/100

**What works:** No broken/oversized raster images — the design is SVG/icon-driven with effectively zero `<img>` tags on marketing pages. Favicon present and correctly referenced.

**Findings:**
- **[High]** No `og:image` anywhere — no visual asset configured for social or AI-search link previews.

---

See `ACTION-PLAN.md` for a prioritized, time-boxed punch list and `audit-data.json` for the structured data backing this report.
