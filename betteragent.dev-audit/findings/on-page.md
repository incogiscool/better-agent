# On-Page SEO — Score: 28/100

**What works:** Single `<h1>` on most pages; `lang="en"` correctly set; clean heading hierarchy on the homepage; full internal nav to all public routes.

**Findings:**
- **[Critical]** Identical `<title>BetterAgent — the agent layer your SaaS is missing</title>` and identical meta description served on `/`, `/pricing`, `/demo`, `/contact`, `/auth/sign-in`, and `/auth/sign-up`. Only `/privacy`, `/terms`, and the docs subdomain pages have unique metadata.
- **[Medium]** `/privacy` and `/terms` render `Privacy Policy — BetterAgent — BetterAgent` (doubled suffix) because both the page's own title and the layout's `title.template` append `— BetterAgent`.
- **[High]** Zero Open Graph or Twitter Card tags anywhere — shared links render with no title, description, or image in Slack/X/LinkedIn.
- **[Medium]** `/demo` has no `<h1>` (same root cause as the content-quality finding).
