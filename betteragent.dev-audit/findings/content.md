# Content Quality — Score: 40/100

**What works:** Homepage copy is specific and avoids generic SaaS filler. Pricing page clearly explains the credit-based billing model with a full comparison table. Docs subdomain has clean, purpose-built MDX content.

**Findings:**
- **[Critical]** `/demo` has only ~9 words of server-rendered text (vs. ~1,000 on the homepage) — a fully client-rendered shell (`<Suspense><VariantSwitcher/></Suspense>`) with no metadata export, no `<h1>`, no static fallback.
- **[High]** No About, team, case-study, or testimonial page anywhere in the site's link graph — no authority/E-E-A-T signal beyond the product copy itself.
- **[Medium]** No blog or long-tail educational content; `/blog` 404s. Not urgent pre-PMF, but worth flagging as a growth lever.
