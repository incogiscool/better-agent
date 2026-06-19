# Performance (CWV) — Score: 65/100 (heuristic — not lab-measured)

**What works:** Prerendered Next.js output via Vercel + Cloudflare edge cache (`x-vercel-cache: HIT`, `x-nextjs-prerender: 1`), HTTP/3, gzip compression, ~260ms TTFB on a cold curl.

**Findings:**
- **[Info]** No PageSpeed Insights/CrUX API access configured in this environment — score is heuristic, not Lighthouse-measured. Homepage loads 16+ separate JS chunks, worth checking bundle size once real metrics are available.
