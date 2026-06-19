# AI Search Readiness — Score: 20/100

**Findings:**
- **[Critical]** Every major AI assistant/answer-engine crawler is blocked in robots.txt (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, meta-externalagent). For a product pitched as "the agent layer your SaaS is missing," this means it's invisible when developers ask ChatGPT/Claude/Gemini what to use to add an agent to their SaaS. `ai-input` access (RAG/grounding) doesn't require also allowing `ai-train`.
- **[Medium]** No `llms.txt` on either domain. The docs subdomain already has clean MDX content (quickstart, CLI reference, tools, components) — cheap to point an llms.txt at it.
