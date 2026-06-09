# BetterAgent Setup Prompt

You are helping a developer add BetterAgent to their Next.js project.
BetterAgent gives the app an AI assistant that can call routes, server
actions, and trigger client-side effects — no extra backend required.

---

## Step 1: Install packages

```bash
npm install -D betteragent-cli
npm install betteragent-react betteragent-next
```

## Step 2: Authenticate

Ask the user for their BetterAgent secret key (format: `ba_secret_...`).
You can find it in the dashboard under project settings. Then run:

```bash
npx betteragent login --key <secret-key>
```

## Step 3: Initialize

Run the setup wizard. It will prompt for a chat component variant.
Sidebar is a good default for most apps.

```bash
npx betteragent init
```

This generates `components/betteragent-provider.tsx` (the `AgentProvider`
wrapper) and scaffolds the tool files.

## Step 4: Discover tools

Scan the project for existing Next.js routes and server actions:

```bash
npx betteragent discover
```

Review the generated files and remove any routes the agent should not
access (admin-only endpoints, internal APIs, etc.).

## Step 5: Sync

Push the tool definitions to the BetterAgent backend:

```bash
npx betteragent sync
```

## Step 6: Add the provider

In the root layout (e.g. `app/layout.tsx`), wrap children with the generated
`AgentProvider`. Replace `endUserId` with the authenticated user's real ID
from your auth system.

```tsx
// app/layout.tsx — Server Component
import { AgentProvider } from "@/components/betteragent-provider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <html>
      <body>
        <AgentProvider
          clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
          apiUrl={process.env.NEXT_PUBLIC_BETTERAGENT_API_URL}
          endUserId={user.id}
        >
          {children}
        </AgentProvider>
      </body>
    </html>
  );
}
```

Add the client key to `.env.local`:

```
NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY=ba_client_...
```

The `clientKey` (ba_client_...) is safe to expose publicly. Never
expose the `secretKey` (ba_secret_...) in client-side code.

Also render the chat component that `betteragent init` installed. The
provider supplies context but renders no UI on its own. For sidebar:

```tsx
import { ChatSidebar } from "@/components/chat/sidebar";

<div className="flex h-screen">
  <main className="flex-1 overflow-y-auto">{children}</main>
  <ChatSidebar title="Assistant" greeting="Hi — how can I help?" />
</div>
```

---

## Tool file reference (for manual edits after discovery)

Tool files teach the agent what it can do. Three file types:

### `routes.betteragent.ts` — HTTP routes called server-to-server

```ts
import { defineRoute } from "betteragent-next";
import { z } from "zod";

export const getUser = defineRoute({
  name: "getUser",
  method: "GET",
  path: "/api/user",
  description: "Get the current authenticated user's profile and settings.",
  schema: z.object({}),
});

export const routes = [getUser];
```

### `server-actions.betteragent.ts` — Next.js Server Actions

```ts
"use server";

import { defineServerAction } from "betteragent-next";
import { z } from "zod";
import { updateProfile as _updateProfile } from "@/app/actions/profile";

// Export name doesn't matter — the agent uses the `name` field.
export const updateUserProfile = defineServerAction({
  name: "updateUserProfile",
  description: "Update the user's display name and bio.",
  schema: z.object({
    name: z.string().min(1).max(100),
    bio:  z.string().max(500).optional(),
  }),
  handler: _updateProfile,
});
```

No array export — Next.js `"use server"` files must only export async functions.

### `actions.betteragent.ts` — Browser-side effects

```ts
import { defineAction } from "betteragent-next";
import { z } from "zod";

export const openModal = defineAction({
  name: "openModal",
  description: "Open a modal or dialog. Use when the user asks to see or edit something in a dialog.",
  schema: z.object({
    name: z.enum(["settings", "profile", "billing"]),
  }),
});

export const actions = [openModal];
```

Register client actions in the provider:

```tsx
<AgentProvider
  clientKey={...}
  endUserId={...}
  actions={{
    openModal: ({ name }) => setOpenDialog(name),
  }}
>
```

---

## Key facts

- **Credits**: 2 per conversation start · 1 per message · 3 per tool call
- **Free plan**: 500 credits/30-day period, no card required
- **Run `betteragent sync`** whenever tool files change
- **Better descriptions = better agent decisions** — describe *when* to use a tool, not just *what* it does
- **Docs**: https://betteragent.dev/docs
- **CLI reference**: https://betteragent.dev/cli
