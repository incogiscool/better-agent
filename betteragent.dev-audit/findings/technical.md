# Technical SEO — Score: 55/100

**What works:** HTTPS + HSTS, clean URLs, robots.txt allows general search crawling (`Content-Signal: search=yes`), mobile viewport meta present, pages are Next.js-prerendered and edge-cached, custom 404 returns proper status code.

**Findings:**
- **[Critical]** No sitemap.xml on either domain — both `/sitemap.xml` paths 404. No `app/sitemap.ts` in the codebase, no `Sitemap:` directive in either robots.txt.
- **[High]** No `<link rel="canonical">` on any of the 8 crawled pages. Worse because the apex domain 307-redirects to `www.betteragent.dev` while `metadataBase` in `app/layout.tsx` points at the apex.
- **[High]** robots.txt (Cloudflare-managed) disallows GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, meta-externalagent, Amazonbot, CloudflareBrowserRenderingCrawler. `Content-Signal: ai-train=no` set globally.
- **[Medium]** No CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, or Permissions-Policy headers.
- **[Low]** Apex→www redirect uses 307 (temporary) instead of 301/308.
