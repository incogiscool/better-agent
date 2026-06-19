# Images — Score: 50/100

**What works:** No broken/oversized raster images — the design is SVG/icon-driven with effectively zero `<img>` tags on marketing pages. A 512x512 icon.png is correctly referenced.

**Findings:**
- **[High]** No `og:image` anywhere — `/opengraph-image` 404s. No visual asset for social or AI-search link previews.
- **[Low]** No `favicon.ico`, `apple-touch-icon.png`, or `manifest.json` (all 404 after the apex→www redirect).
