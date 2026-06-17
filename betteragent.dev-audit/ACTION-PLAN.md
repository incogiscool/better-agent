# Action Plan: betteragent.dev

## Phase 1 — Critical Fixes (Week 1)
- [ ] Write unique `<title>` + meta description for `/pricing`, `/demo`, `/contact`, `/auth/sign-in`, `/auth/sign-up` (currently all identical to the homepage)
- [ ] Add `app/sitemap.ts` for betteragent.dev and an equivalent for docs.betteragent.dev; add `Sitemap:` line to both robots.txt files
- [ ] Server-render real content (heading, description, static preview) on `/demo` — currently ~50 characters of text, fully client-only
- [ ] Decide and fix the AI-crawler block in robots.txt — allow `ai-input` for ClaudeBot/GPTBot/Google-Extended at minimum, even if `ai-train=no` is kept

## Phase 2 — High-Impact Improvements (Weeks 2-3)
- [ ] Add canonical tags sitewide via Next.js `alternates.canonical`
- [ ] Add Open Graph + Twitter Card tags with one branded 1200x630 image (none exist today)
- [ ] Add Organization + SoftwareApplication/Product JSON-LD — map directly from the existing `/pricing` comparison table
- [ ] Add `llms.txt` pointing into docs.betteragent.dev (quickstart, ai-setup, cli, tools, components)

## Phase 3 — Content & Authority (Month 2)
- [ ] Add an About/company page (founder/team info — zero authority signal exists today)
- [ ] Add at least one customer testimonial or usage stat to the homepage
- [ ] Switch apex→www redirect from 307 to 301/308
- [ ] Add baseline security headers (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

## Phase 4 — Monitoring & Iteration (Ongoing)
- [ ] Re-run PageSpeed Insights/CrUX with an API key for real Core Web Vitals (PSI was rate-limited and CrUX needs a key in this environment — current Performance score is a heuristic, not measured)
- [ ] Consider extending docs with guides/blog content for long-tail and AI-citation surface area once core priorities allow
