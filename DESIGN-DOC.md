# BetterAgent: Master Design Document

---

## Part 1: The Application

### What it is

BetterAgent is a hosted agent platform that makes any web app AI-native. Developers point it at their backend, install components à la shadcn, and their app gets a chat agent that can read data and trigger server-side or client-side effects on behalf of end users. Our goal for this application (including the web app) is to create the best developer experience possible.

**Pitch:** _"Pick your chat layout, sync your routes and actions, drop in the components — your app has an AI agent that actually does things."_

### Three users

- **Developer** — installs CLI, exposes tools, embeds components
- **End user** — the developer's customer, who chats with the agent inside the developer's app
- **Operator** — uses dashboard to monitor, debug, override (often the developer)

### Three tool types (in developer code)

- **Routes** — HTTP endpoints. Called server-to-server by the chat engine.
- **Server Actions** — Next.js Server Actions. Invoked through the framework runtime by the client component.
- **Client Actions** — pure client-side effects (open modal, navigate, refresh).

### Two tool types (at the protocol level)

The protocol unifies Server Actions and Client Actions because they behave identically from the chat engine's perspective:

- **`route`** — chat engine performs HTTP call to customer's `baseUrl + path`
- **`client_invocation`** — chat engine emits payload to component, which dispatches to local handler

The split between Server Actions and Client Actions only matters in developer-facing code. This keeps the protocol simple and framework-agnostic — Vue/Svelte/Remix integrations can map their idiomatic patterns to `client_invocation` later.

### The protocol (the moat)

A normalized JSON-Schema-based contract for tool definitions and chat. SDKs and CLIs are conveniences on top. Framework-agnostic by design, even though we ship Next.js support first.

---

## Part 2: Tech Stack

| Layer                     | Choice                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Language                  | TypeScript everywhere                                                              |
| Frontend (dashboard)      | Next.js 16, Tailwind 4, shadcn (`--preset buH8COm`)                                |
| Backend                   | Next.js API routes, deployed to Vercel                                             |
| LLM SDK                   | Vercel AI SDK, isolated behind `ChatEngine` interface                              |
| Default model             | Claude Sonnet 4.6                                                                  |
| Database                  | Postgres on Neon, Prisma ORM                                                       |
| Auth                      | Better Auth (email + Google)                                                       |
| Payments                  | Stripe (subscriptions + metered overage)                                           |
| Email                     | Resend                                                                             |
| CLI distribution          | npm                                                                                |
| Component distribution    | Custom registry à la shadcn                                                        |
| React SDK                 | `@betteragent/react` (hooks/types only, no rendering)                              |
| Next.js SDK               | `@betteragent/next` (exposeToAgent, defineRoute, defineAction, defineServerAction) |
| Schema inference          | TypeScript compiler API + ts-to-zod                                                |
| AI description generation | LLM call at sync time (Sonnet via own API)                                         |

---

## Part 3: Architecture

Six components:

1. **Dashboard + marketing site** — Next.js app
2. **Core API** — `/v1/sync`, `/v1/chat`, `/v1/execute-result`, dashboard endpoints
3. **Chat Engine** — server-side wrapper around AI SDK
4. **CLI** — `@betteragent/cli`, syncs tools, manages component registry, infers schemas
5. **React SDK** — `@betteragent/react` package (hooks, types, protocol)
6. **Component registry** — JSON manifest at `betteragent.dev/registry`

Multi-tenant from day one. Every query filters by `projectId` or `ownerId`.

---

## Part 4: Data Model

### Core entities

- `User` — auth identity, owns projects
- `Project` — name, baseUrl, clientKey, secretKey (hashed), systemPrompt, plan, Stripe IDs, billingCycleAnchor
- `Tool` — synced tool definition (name, type, method, path, schema, description, version)
- `ToolOverride` — dashboard-edited overrides (description, enabled), separate from sync

### Conversations

- `Conversation` — projectId, endUserId, title
- `Message` — role, content, toolCalls, toolCallId
- `ToolExecution` — input, output, status, durationMs, errorMessage, toolVersion

### Billing

- `BillingPeriod` — projectId, startsAt, endsAt, includedCredits, creditsUsed (atomic), overageCredits
- `CreditEvent` — immutable ledger: type, credits, tokensInput/Output/Cached, costUsd, model, metadata

---

## Part 5: Pricing

**Free**

- 500 credits/month _(~25 conversations)_ — on us
- 1 project, 7-day history, watermarked
- Hard cap, no overage
- Hosted tokens (Sonnet 4.6)

**Pro — $39/month**

- 10,000 credits/month _(~500 conversations)_
- $5 per 1,000 additional credits _(~50 conversations)_
- Unlimited projects, no watermark, full history
- Hosted tokens

**Enterprise — Custom**

- BYOK
- Custom credit allotments
- SSO, SLA, self-host

### Credit weights

- Conversation start: 2 credits
- Message: 1 credit
- Tool call: 3 credits

### Universal cost-control caps

- Max 20 turns per conversation
- Max 80k tokens per conversation
- Max 8KB per tool result (truncate)
- Per-project monthly token budget (hard limit)
- Per-end-user rate limit: 20 messages/minute

### Watermark

Honor system. Hardcoded "Powered by BetterAgent" in default container components. Pro/Enterprise customers delete the line. No server enforcement.

---

## Part 6: Tool System (with DX automation)

### The minimum viable tool definition

The shortest path to exposing a tool:

```typescript
import { exposeToAgent } from "@betteragent/next";
import { createProject, updateProject, deleteProject } from "@/app/actions";

export const serverActions = [
  exposeToAgent(createProject),
  exposeToAgent(updateProject),
  exposeToAgent(deleteProject),
];
```

That's the entire definition for three tools. The CLI infers everything else at sync time.

### What gets inferred

| Field         | Source                                 | Fallback                                   |
| ------------- | -------------------------------------- | ------------------------------------------ |
| `name`        | Function reference's `.name`           | Required override if anonymous             |
| `schema`      | TypeScript types of handler parameters | Required override if types are too complex |
| `description` | JSDoc comment on handler               | AI-generated from function source          |
| `type`        | Which file/helper used                 | N/A (explicit)                             |

### When developers need to write more

The minimal form covers maybe 70% of cases. For the rest:

```typescript
defineServerAction({
  handler: createProject,
  // Override inferred fields:
  name: "create_project", // snake_case for the LLM
  description: "Creates a new project for the user. Cannot be undone.",
  schema: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
  }),
});
```

`exposeToAgent` and `defineServerAction` produce the same output — the latter is just `exposeToAgent` with all overrides explicit. Developers reach for it when inference isn't enough.

### Three files in developer code

**`routes.betteragent.ts`** — HTTP routes:

```typescript
import { defineRoute, exposeRoute } from "@betteragent/next";

// Minimal: from a route handler reference
import { GET as getProjects } from "@/app/api/projects/route";

export const routes = [
  exposeRoute(getProjects, { method: "GET", path: "/api/projects" }),
  // ... or fully manual:
  defineRoute({
    name: "searchProjects",
    method: "GET",
    path: "/api/projects/search",
    description: "Search projects by name",
    schema: z.object({ q: z.string() }),
  }),
];
```

**`server-actions.betteragent.ts`** — Next.js Server Actions:

```typescript
import { exposeToAgent } from "@betteragent/next";
import { createProject, deleteProject, archiveProject } from "@/app/actions";

export const serverActions = [
  exposeToAgent(createProject),
  exposeToAgent(deleteProject),
  exposeToAgent(archiveProject),
];
```

**`actions.betteragent.ts`** — pure client actions (still need explicit declarations because they're behavior, not exported functions):

```typescript
import { defineAction } from "@betteragent/next";

export const actions = [
  defineAction({
    name: "openSettingsModal",
    description: "Opens the settings modal",
    schema: z.object({
      tab: z.enum(["profile", "billing", "team"]).optional(),
    }),
  }),
];
```

### CLI commands for tool DX

**`betteragent discover`** — scan codebase, suggest tools to expose:

```bash
$ betteragent discover

Scanning project for tool candidates...

API Routes (8 found in src/app/api/):
  □ GET    /api/projects
  □ POST   /api/projects
  □ GET    /api/projects/[id]
  ...

Server Actions (12 found):
  □ createProject     (src/app/actions.ts:14)
  □ updateProject     (src/app/actions.ts:28)
  ...

? Which tools should be available to the agent?
  [interactive multi-select]

✓ Selected 14 tools
✓ Generating schemas from TypeScript types...
✓ Generating descriptions via AI...
✓ Wrote routes.betteragent.ts (5 routes)
✓ Wrote server-actions.betteragent.ts (8 server actions)
✓ Wrote actions.betteragent.ts (template only — add manually)

Review the files, then run `betteragent sync`.
```

**`betteragent sync`** — sync to backend, with auto-fill at sync time:

```bash
$ betteragent sync

Reading tool definitions...
✓ 5 routes, 8 server actions, 2 client actions

Inferring missing fields:
  ✓ createProject: schema inferred from TypeScript
  ✓ deleteProject: schema inferred, description from JSDoc
  ⚠ updateProject: no description, no JSDoc

? Generate description for updateProject via AI? › Yes
✓ Generated: "Updates a project's name and description by ID. Returns the updated project."

Diff vs server:
  + 3 new tools
  ~ 2 changed (description updated)
  - 1 removed

? Apply changes? › Yes

✓ Synced to BetterAgent
```

**`betteragent generate <tool>`** — regenerate AI description for a specific tool:

```bash
$ betteragent generate createProject

Reading function source...
Generating description...

Old: "Creates a new project"
New: "Creates a new project with the given name. Initializes default settings, adds the current user as owner, and triggers a revalidation of the projects list."

? Use new description? › Yes
✓ Updated server-actions.betteragent.ts
```

**`betteragent list`** — show currently synced tools:

```bash
$ betteragent list

Tools in this project (15):
  Routes (5):
    GET    /api/projects                listProjects
    GET    /api/projects/[id]           getProject
    GET    /api/projects/search         searchProjects
    ...
  Server Actions (8):
    createProject                       (src/app/actions.ts:14)
    updateProject                       (src/app/actions.ts:28)
    ...
  Client Actions (2):
    openSettingsModal
    refreshDashboard
```

### How inference works under the hood

At sync time (not runtime), the CLI:

1. Reads tool files
2. For each `exposeToAgent(handler)` reference:
   - Resolves the handler import path
   - Runs TypeScript compiler API on the handler's source
   - Extracts parameter type → converts to JSON Schema via `ts-to-zod` or equivalent
   - Extracts JSDoc → uses as description
3. For tools missing descriptions:
   - Reads the handler's source code
   - Sends to LLM with a prompt: "Write a one-sentence description of what this function does, focused on what an AI agent would need to know to call it correctly"
   - Caches result (keyed on source hash) to avoid re-generating unchanged code
   - Prompts developer for confirmation before using AI-generated content
4. Validates everything against the protocol schema
5. POSTs to `/v1/sync`

The runtime doesn't do any of this. Tool files are static at runtime; only the CLI does inference.

### Sync flow

`betteragent sync` reads all three files, normalizes them, sends only metadata (handlers stay local):

```json
{
  "tools": [
    { "name": "getProjects", "type": "route", "method": "GET", "path": "/api/projects", "description": "...", "schema": {...} },
    { "name": "createProject", "type": "client_invocation", "description": "...", "schema": {...} },
    { "name": "openSettingsModal", "type": "client_invocation", "description": "...", "schema": {...} }
  ]
}
```

### Component-side dispatch

`BetterAgentProvider` accepts both serverActions and client actions:

```tsx
<BetterAgentProvider
  clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
  authToken={() => getAuthToken()}
  endUserId={user.id}
  serverActions={serverActions}
  actions={{
    openSettingsModal: ({ tab }) =>
      router.push(`/settings${tab ? `?tab=${tab}` : ""}`),
  }}
  onToolSuccess={() => router.refresh()}
>
  <ChatDrawer />
</BetterAgentProvider>
```

When an `action_call` event arrives, the dispatcher checks serverActions first, then actions, validates input against the schema, calls the handler, posts result to `/v1/execute-result`.

### Server Action gotchas

- **Don't call `redirect()` or `notFound()`** from agent-invoked Server Actions — return navigation hints instead and let the client decide
- **Auth Just Works** — Server Actions have access to user session via cookies, no explicit forwarding needed
- **`revalidatePath` / `revalidateTag` work normally** — agent-invoked mutations revalidate routes just like button-click mutations
- **Schema validation happens in the wrapper** — `defineServerAction`/`exposeToAgent` validates input before calling the handler, returns structured errors to the agent

---

## Part 7: Component System

### Distribution model

shadcn-style registry. Components are not installed via npm — they're copied as source code into customer's codebase via CLI. Customer fully owns and edits them.

### Two-layer ownership

| `@betteragent/react` (npm package)  | Components (customer's codebase)             |
| ----------------------------------- | -------------------------------------------- |
| `BetterAgentProvider`, hooks, types | All rendering, all styling                   |
| Protocol implementation             | All structure                                |
| Streaming, state management         | All visual choices                           |
| Action dispatcher                   | All component composition                    |
| Auto-updates via npm                | Updated selectively via `betteragent update` |

### Categories

- **Containers** — chat-drawer, chat-sidebar, chat-floating-panel, chat-full-page, chat-inline
- **Pieces** — chat-messages, chat-message, chat-input, chat-empty-state, chat-header, chat-tool-call, chat-markdown, chat-error, chat-suggested-prompts
- **Extensions** — voice-input, file-attachment, chat-history-list, feedback-buttons
- **Tool renderers** — tool-card, tool-form, tool-table, tool-confirm, tool-progress

### Theming

CSS variables that inherit from shadcn tokens, exposed via Tailwind utility classes prefixed `ba-*`. 18 total variables (10 colors, 4 message-specific, 4 shape/typography). Components match shadcn theme automatically; sensible defaults when shadcn isn't present.

### CLI commands (component-related)

- `betteragent init` — pick a block, install components, scaffold tool files
- `betteragent add <component>` — add specific component
- `betteragent remove <component>` — remove component
- `betteragent list` — show installed tools and components

---

## Part 8: Build Checklist

### Phase 0: Setup (Day 1–2)

- [ ] Lock domain name, buy `.com` and `.dev`
- [ ] Create GitHub org and main repo
- [ ] Create Next.js 16 app with `npx shadcn@latest init --preset buH8COm`
- [ ] Set up Tailwind 4
- [ ] Set up Neon project, copy connection string
- [ ] Set up Better Auth (email + Google)
- [ ] Set up Resend
- [ ] Set up Vercel, deploy empty app, confirm CI/CD
- [ ] Set up Stripe account (test mode), products configured
- [ ] Set up basic monitoring (Sentry or similar & Posthog)

### Phase 1: Foundation (Week 1)

**Database**

- [ ] Prisma schema: User, Project tables
- [ ] Migrations applied to Neon
- [ ] Seed script for local dev

**Auth**

- [ ] Better Auth signup, signin, signout
- [ ] Email verification required
- [ ] Google OAuth working
- [ ] Protected route middleware

**Dashboard skeleton**

- [ ] Layout with sidebar nav
- [ ] `/dashboard` — list projects
- [ ] `/dashboard/projects/new` — create project flow
- [ ] `/dashboard/projects/[id]` — project overview page
- [ ] Generate clientKey and secretKey on creation
- [ ] Hash secretKey (argon2)
- [ ] Show secretKey once, never again
- [ ] Copy-to-clipboard for keys

**Project settings**

- [ ] `/dashboard/projects/[id]/settings` — name, baseUrl, system prompt
- [ ] Edit and save
- [ ] Regenerate keys (with confirmation)

### Phase 2: Protocol + CLI Sync + DX Automation (Weeks 2–3)

**Database**

- [ ] Prisma schema: Tool, ToolOverride
- [ ] Migrations

**Sync endpoint**

- [ ] `POST /v1/sync` with secretKey auth
- [ ] Tenant scoping (lookup project from key)
- [ ] Diff logic: add new, update changed, soft-delete removed
- [ ] Version increment on schema change
- [ ] JSON Schema validation on incoming definitions
- [ ] Accept both `route` and `client_invocation` types

**`@betteragent/next` package**

- [ ] `defineRoute()` helper
- [ ] `defineAction()` helper (client actions)
- [ ] `defineServerAction()` helper with schema validation
- [ ] `exposeToAgent()` minimal helper
- [ ] `exposeRoute()` for HTTP route handlers
- [ ] Zod-to-JSON-Schema conversion at runtime
- [ ] Type inference for handler input from schema

**Schema inference (CLI-side)**

- [ ] TypeScript compiler API integration
- [ ] Resolve handler import paths from `exposeToAgent` references
- [ ] Extract parameter types
- [ ] Convert types to JSON Schema (ts-to-zod or custom)
- [ ] Handle complex types gracefully (warn, fall back to manual)
- [ ] Edge case handling: generics, conditional types, branded types

**JSDoc extraction (CLI-side)**

- [ ] Parse JSDoc comments from handler source
- [ ] Extract main description
- [ ] Extract `@param` docs as field descriptions
- [ ] Map to JSON Schema descriptions

**AI description generation (CLI-side)**

- [ ] Endpoint on backend that accepts function source, returns description
- [ ] Prompt engineering for "describe this function for an AI agent"
- [ ] Cache by source hash (no regeneration if unchanged)
- [ ] Confirmation prompt before using generated content
- [ ] Cost the description generation against the project's credits

**Auto-discovery (CLI-side)**

- [ ] File walker for `src/app/api/**/route.ts`
- [ ] Detect exported HTTP method handlers
- [ ] File walker for `'use server'` directives
- [ ] Detect exported async functions
- [ ] Interactive multi-select UI

**CLI scaffold**

- [ ] `@betteragent/cli` package set up
- [ ] `betteragent login` — paste-key flow for v1 (OAuth later)
- [ ] `betteragent init` — interactive prompts:
  - [ ] Write `routes.betteragent.ts` template
  - [ ] Write `actions.betteragent.ts` template
  - [ ] Write `server-actions.betteragent.ts` template
  - [ ] Write `betteragent.config.json`
  - [ ] Add `.env.local` entries
- [ ] `betteragent discover` — scan codebase, suggest tools
- [ ] `betteragent sync` — read all three tool files, infer missing fields, generate descriptions, POST to backend
- [ ] `betteragent generate <tool>` — regenerate description
- [ ] `betteragent list` — show synced tools
- [ ] Error handling (auth failures, network, validation errors) with helpful messages

**Dashboard tools view**

- [ ] `/dashboard/projects/[id]/tools` — list synced tools
- [ ] Show schema, description (with "AI-generated" badge if applicable), type, method, path
- [ ] Search/filter
- [ ] Show "last synced" timestamp

### Phase 3: Billing Foundation (Week 4)

**Database**

- [ ] Prisma schema: BillingPeriod, CreditEvent
- [ ] Indexes on (projectId, createdAt) for CreditEvent
- [ ] Migrations

**Atomic credit logic**

- [ ] `recordCreditEvent()` function (insert + atomic increment in transaction)
- [ ] `getCurrentBillingPeriod(projectId)` — get-or-create
- [ ] `hasMinimumCredits()` check

**Free tier**

- [ ] Period rollover via cron job (daily check, create new period when needed)
- [ ] Hard cap enforcement at chat endpoint level

**Stripe integration**

- [ ] Stripe products: Pro subscription, metered overage item
- [ ] `/dashboard/billing` page with Stripe Checkout
- [ ] Customer portal link for subscription management
- [ ] Webhook handler: `/api/webhooks/stripe`
  - [ ] `checkout.session.completed` — upgrade to Pro
  - [ ] `customer.subscription.updated` — plan changes
  - [ ] `customer.subscription.deleted` — downgrade to free
  - [ ] `invoice.paid` — close period, create new one
  - [ ] `invoice.payment_failed` — flag for review

**Period rollover for paid**

- [ ] On `invoice.paid` webhook: close BillingPeriod, create new one with fresh credits
- [ ] Lazy-create fallback if webhook delayed
- [ ] Idempotent

### Phase 4: Chat Engine (Weeks 5–6)

**Database**

- [ ] Prisma schema: Conversation, Message, ToolExecution
- [ ] Migrations

**ChatEngine module**

- [ ] Wrap Vercel AI SDK behind interface (so we can swap providers later)
- [ ] `streamChat()` method
- [ ] System prompt assembly (deterministic, cache-friendly)
- [ ] Tool map builder (load synced tools + apply overrides)
- [ ] Conversation history loader
- [ ] Cache marker placement (after system prompt + tools, optionally after history)

**Chat endpoint**

- [ ] `POST /v1/chat` with clientKey auth
- [ ] Tenant scoping
- [ ] Pre-flight credit check
- [ ] Conversation create-or-load
- [ ] SSE streaming response
- [ ] Event types: `text_delta`, `tool_call`, `tool_result`, `action_call`, `done`, `error`
- [ ] Token count capture on `onFinish`
- [ ] Idempotency key support

**Route tool execution**

- [ ] HTTP call to `baseUrl + path` with method
- [ ] Forward `X-End-User-Token` as `Authorization`
- [ ] JSON Schema validation of input before sending
- [ ] Timeout (30s default)
- [ ] Tool result truncation (8KB max)
- [ ] ToolExecution row recorded
- [ ] Stream `tool_result` to client

**Client invocation execution (covers both Server Actions and Client Actions)**

- [ ] Stream `action_call` event with toolCallId
- [ ] End stream
- [ ] `POST /v1/execute-result` endpoint
- [ ] Resume conversation loop with result
- [ ] Timeout for action results (60s)
- [ ] Mark abandoned if no result within timeout

**Credit tracking on chat**

- [ ] Conversation start event (2 credits)
- [ ] Per-tool-call event (3 credits)
- [ ] Per-message event (1 credit, with token counts)
- [ ] Cost calculation per event (tokens × model rate)
- [ ] Soft threshold checks (80%, 100%) → enqueue email

**Hard caps**

- [ ] Max 20 turns per conversation
- [ ] Max 80k tokens per conversation
- [ ] Per-project token budget circuit breaker
- [ ] Graceful end-of-conversation messaging when caps hit

**Rate limiting**

- [ ] 20 messages/minute per endUserId per project
- [ ] Per-IP signup rate limit

### Phase 5: React SDK (Week 7)

**Package: `@betteragent/react`**

- [ ] Set up package, build pipeline (tsup or similar)
- [ ] Publish to npm (initially as `0.x` versions)
- [ ] `BetterAgentProvider` component
  - [ ] Context: clientKey, authToken, endUserId, actions, serverActions, toolRenderers
  - [ ] Initialize chat client
- [ ] `useChatStream()` hook
  - [ ] Manages messages array
  - [ ] Handles SSE stream
  - [ ] Returns sendMessage, isStreaming, error, stop
- [ ] `useBetterAgent()` hook — read provider state
- [ ] `useToolCall()` hook — for tool renderers
- [ ] TypeScript types: Message, ToolCall, Action, ChatStreamState
- [ ] **Unified action dispatcher**:
  - [ ] On `action_call` event, look up handler in serverActions first, then actions
  - [ ] Validate input against schema before invoking
  - [ ] Catch errors, return structured results
  - [ ] POST result to `/v1/execute-result`
- [ ] `cn()` utility

### Phase 6: Component Registry (Weeks 8–9)

**Registry infrastructure**

- [ ] Registry routes on dashboard app: `/registry/index.json`, `/registry/components/[name].json`, `/registry/blocks/[name].json`
- [ ] Component file storage (in repo, served from filesystem)
- [ ] Schema for component manifest
- [ ] Block manifest

**CSS variables**

- [ ] Define final 18 CSS variables
- [ ] `globals.css` template with `:root`, `.dark`, `@theme` blocks
- [ ] Inheritance from shadcn tokens with fallbacks
- [ ] Dark mode tested

**Components — pieces (build in this order)**

- [ ] `chat-message` — bubble for user/assistant/tool
- [ ] `chat-messages` — scrolling list with auto-scroll
- [ ] `chat-input` — auto-resize textarea, send button, keyboard shortcuts
- [ ] `chat-header` — title, close button
- [ ] `chat-empty-state` — friendly intro
- [ ] `chat-suggested-prompts` — quick-start chips
- [ ] `chat-tool-call` — generic "Calling X..." indicator
- [ ] `chat-markdown` — streaming markdown via `streamdown`
- [ ] `chat-error` — error states (credit limit, network, tool failure)

**Components — containers**

- [ ] `chat-drawer` — right-side shadcn drawer + floating trigger
- [ ] `chat-trigger` — floating button
- [ ] `chat-sidebar` — persistent layout

**Blocks**

- [ ] `drawer-chat` — bundle of drawer + all needed pieces
- [ ] `sidebar-chat` — bundle of sidebar + all needed pieces

**CLI registry commands**

- [ ] `betteragent init` updated to pick a block
- [ ] `betteragent add <name>` — single or multi
- [ ] `betteragent add` (no args) — interactive picker
- [ ] `betteragent remove <name>`
- [ ] `betteragent list` shows installed components
- [ ] Dependency resolution
- [ ] Shadcn dependency installation (run `npx shadcn add` for needed primitives)
- [ ] `betteragent.config.json` tracking installed components

**Watermark**

- [ ] Hardcoded in `chat-drawer.tsx` and `chat-sidebar.tsx`
- [ ] Comment explaining ToS requirement

### Phase 7: Dashboard Polish (Week 10)

**Conversation history**

- [ ] `/dashboard/projects/[id]/conversations` — list view
- [ ] Filter by date, end user, status
- [ ] `/dashboard/projects/[id]/conversations/[id]` — full timeline
- [ ] Message rendering with role indicators
- [ ] Tool execution timeline with input/output expandable

**Tool overrides**

- [ ] Toggle enabled/disabled per tool
- [ ] Edit description (override version)
- [ ] Show synced description vs override description
- [ ] Show "AI-generated" badge if originally generated
- [ ] Reset override
- [ ] Distinguish route vs client_invocation in UI

**Usage view**

- [ ] `/dashboard/projects/[id]/usage`
- [ ] Current period: credits used, % of cap, conversations count
- [ ] Estimated end-of-period
- [ ] Historical periods (last 6 months)
- [ ] Cost breakdown (your internal cost vs customer's credit cost)
- [ ] Cache hit rate metric
- [ ] Top conversations by cost

**Project settings**

- [ ] System prompt editor with character count
- [ ] Model selector (Sonnet/Haiku, when relevant)
- [ ] Base URL editor
- [ ] Delete project (with double confirmation)

### Phase 8: Demo SaaS (Week 11)

- [ ] Pick the demo: bookmark manager or project tracker
- [ ] Build it with shadcn + the same Lyra preset
- [ ] **2+ HTTP routes** (e.g., listBookmarks, searchBookmarks)
- [ ] **2+ Server Actions** (e.g., createBookmark, tagBookmark, deleteBookmark)
- [ ] **2+ Client Actions** (e.g., openBookmark/navigate, refreshList)
- [ ] Real auth (Better Auth with Google)
- [ ] Use BetterAgent to make it AI-native
- [ ] **Use `betteragent discover` to set up tools** (showcase the DX)
- [ ] Document the `redirect()` gotcha visibly in the demo code
- [ ] Deploy publicly as `demo.betteragent.dev`
- [ ] Record video walkthrough showing all three tool types in action
- [ ] Record a "from zero to AI agent in 5 minutes" video using `discover`

### Phase 9: Production Readiness (Week 12)

**Operational**

- [ ] Reconciliation queries: actual cost vs credit consumption per project
- [ ] Anomaly detection: top 10 unprofitable customers report
- [ ] Stripe sync verification (your overage vs Stripe charges)
- [ ] Error budget alerts (Sentry or similar)
- [ ] Database backups verified

**User-facing**

- [ ] Email notifications: 80% credit warning, 100% credit hit, payment failed
- [ ] Onboarding flow: empty state → "create first project" → CLI install instructions → `betteragent discover` → first sync celebration
- [ ] Dashboard empty states designed
- [ ] Loading states everywhere
- [ ] 404, 500 pages

**Marketing site**

- [ ] Landing page with hero, demo video, code example, pricing
- [ ] Pricing page with credit explanations
- [ ] Docs site (Mintlify or Fumadocs)
  - [ ] Quick start
  - [ ] CLI reference (init, discover, sync, generate, add, remove, list)
  - [ ] Component registry
  - [ ] API reference
  - [ ] Concepts (routes, server actions, client actions, credits)
  - [ ] Tool DX guide (exposeToAgent, inference, AI descriptions)
  - [ ] Examples (with all three tool types)
  - [ ] Server Action best practices (the redirect gotcha, etc.)
- [ ] Legal: Terms of Service, Privacy Policy, DPA template

**Abuse prevention**

- [ ] Email verification enforced
- [ ] IP rate limiting on signup
- [ ] Credit-burn anomaly alerts
- [ ] Manual ban/disable functionality

### Phase 10: First Users (Week 13+)

- [ ] Recruit 5 friendly developers (Twitter, IndieHackers, friends)
- [ ] Onboard each via screen share, take notes
- [ ] Watch them use `betteragent discover` — does it actually help?
- [ ] Fix top 3 friction points before adding features
- [ ] Get first paying customer
- [ ] Then plan: OpenAPI import, Express adapter, evals, Team tier, more frameworks

---

## Part 9: Decision Log

These are locked in. Don't relitigate without strong reason:

| Decision               | Choice                                                        |
| ---------------------- | ------------------------------------------------------------- |
| Language               | TypeScript                                                    |
| LLM SDK                | Vercel AI SDK                                                 |
| Hosting                | Vercel                                                        |
| Multi-tenant           | Yes, from day one                                             |
| Free plan              | 500 credits, hosted tokens, watermark                         |
| Paid plan              | $39/mo Pro, 10k credits, $5/1k overage                        |
| BYOK                   | Enterprise tier only                                          |
| Watermark enforcement  | Honor system                                                  |
| Source of truth        | Code (sync), with dashboard overrides separate                |
| Action protocol        | Stream-then-resume                                            |
| Component distribution | shadcn-style registry                                         |
| Component ownership    | Customer owns rendering, package owns protocol                |
| First framework        | Next.js                                                       |
| First tool renderers   | Generic only (custom v1.5+)                                   |
| Server Actions support | Yes, via `defineServerAction` and `exposeToAgent`             |
| Tool type unification  | 3 in dev code, 2 in protocol (`route`, `client_invocation`)   |
| **Schema inference**   | **TypeScript types + JSDoc, at sync time, not runtime**       |
| **AI descriptions**    | **Generated on demand, reviewable, cached by source hash**    |
| **Auto-discovery**     | **`betteragent discover` for one-time setup, not continuous** |
| **Inference scope**    | **CLI-side only; runtime stays static**                       |

---

## Part 10: Things to Decide Before Coding

Don't start without locking these:

- [ ] Domain name (verify availability)
- [ ] Default model: Sonnet only, or expose Haiku option in dashboard?
- [ ] Component registry hosting: same Next.js app, or separate static site?
- [ ] Email verification provider: Resend confirmed?
- [ ] Public roadmap: yes/no?
- [ ] Beta period before general availability: yes/no, how long?
- [ ] AI description generation: charged against project credits or free utility?

---

## Part 11: Risk Watchlist

Things that could derail the project, ranked by likelihood:

1. **Cost runaway from buggy customer integration** — mitigated by hard caps and circuit breakers, not by hope
2. **Streaming + Vercel timeouts** — verify Vercel's behavior with long-lived SSE before committing
3. **Stripe webhook reliability** — must be idempotent and have lazy fallback
4. **Component registry maintenance** — every component shipped is a permanent commitment, ship few and ship well
5. **Dogfooding gap** — if you don't use BetterAgent yourself by week 8, the DX will be bad
6. **Pricing model wrong** — first 50 customers will tell you if credits are too cheap or too expensive
7. **AI SDK version churn** — pin versions, isolate behind ChatEngine interface
8. **Auth-forwarding security (routes)** — get this right; sloppy here = data breaches
9. **Server Action coupling to Next.js internals** — don't try to invoke them server-to-server; always go through the client component
10. **Schema inference edge cases** — complex TypeScript types may fail to convert; fall back gracefully and document limitations
11. **AI description quality** — bad descriptions cause bad agent behavior; always allow review, cache aggressively, expose regeneration

---

## Part 12: The DX Story

This is what differentiates BetterAgent from "just use the AI SDK directly":

**Without BetterAgent:**

1. Read AI SDK docs
2. Write tool definitions for each route by hand
3. Write Zod schemas for each
4. Write descriptions for each
5. Set up streaming endpoint
6. Build chat UI from scratch
7. Handle tool execution loop
8. Build conversation persistence
9. Build observability
10. Maintain all of this forever

**With BetterAgent:**

1. `betteragent init` — picks layout, scaffolds files
2. `betteragent discover` — finds tool candidates, you select
3. AI descriptions generated automatically, reviewed in your editor
4. `betteragent sync` — done

Five minutes from npm install to working agent.

This is the marketing message. This is the demo video. This is what gets shared on Twitter.

---

## Part 13: The Single Most Important Thing

Build the **Demo SaaS in Phase 8 and use it daily from week 11 onward.** Every friction you find in your own product saves five customer support tickets. Every hour of dogfooding before public launch is worth ten hours of building features.

The demo also has another job: **it's the proof that the DX automation actually works.** If you can't run `betteragent discover` on the demo and have it produce a usable result, the inference logic isn't ready. If the AI-generated descriptions are mediocre on your own demo, they'll be worse on customers' code. Test on your own product first.

The fastest path to a good product is: build → use → fix → use → fix. The slowest path is: build → polish → launch → discover problems → rebuild.

---

## Timeline summary

- **Weeks 1:** Foundation — _milestone: dashboard with auth and project CRUD_
- **Weeks 2–3:** Sync + DX automation — _milestone: `discover` and `sync` work end-to-end_
- **Week 4:** Billing — _milestone: paid customer can subscribe and be charged_
- **Weeks 5–6:** Chat engine — _milestone: curl `/v1/chat` and watch a tool execute_
- **Week 7:** React SDK — _milestone: hooks work in a test app, Server Actions invoked_
- **Weeks 8–9:** Components + registry — _milestone: `betteragent init` produces working chat_
- **Week 10:** Dashboard polish — _milestone: dashboard is debuggable_
- **Week 11:** Demo SaaS — _milestone: end-to-end real product using all 3 tool types, set up via `discover`_
- **Week 12:** Production readiness — _milestone: ready for outside users_
- **Week 13+:** First users — _milestone: first paying customer_

13 weeks of full-time work (one extra week for DX automation). Realistically 4–6 months for a solo founder with a life.

---
