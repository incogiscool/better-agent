export const AGENT_PROMPT = `# BetterAgent Setup Prompt

You are helping a developer add BetterAgent to their Next.js project.
BetterAgent gives the app an AI assistant that can call routes, server
actions, and trigger client-side effects — no extra backend required.

---

## Step 1: Install packages

npm install -D @betteragent/cli
npm install @betteragent/react @betteragent/next

## Step 2: Authenticate

Ask the user for their BetterAgent secret key (format: ba_secret_...).
They can find it in the dashboard under project settings. Then run:

  npx betteragent login --key <secret-key>

## Step 3: Initialize

Run the setup wizard. It will prompt for a chat component variant.
Sidebar is a good default for most apps.

  npx betteragent init

## Step 4: Discover tools

Scan the project for existing Next.js routes and server actions:

  npx betteragent discover

Review the generated files and remove any routes the agent should not
access (admin-only endpoints, internal APIs, etc.).

## Step 5: Sync

Push the tool definitions to the BetterAgent backend:

  npx betteragent sync

## Step 6: Add the provider

In the root layout (e.g. app/layout.tsx), wrap children with
BetterAgentProvider. Replace endUserId with the authenticated user's
real ID from your auth system.

If the agent exposes route tools that read or write per-user data,
pass authToken — a string or (async) getter for the end user's token.
The chat engine forwards it to your routes as the Authorization header
so they run as the logged-in user. Without it, route tools call your
backend with no caller identity.

  import { BetterAgentProvider } from "@betteragent/react";
  import { serverActions } from "./server-actions.betteragent";

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          <BetterAgentProvider
            clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
            apiUrl={process.env.NEXT_PUBLIC_BETTERAGENT_API_URL}
            endUserId="user-id-here"
            authToken={() => getEndUserToken()} // forwarded to route tools
            serverActions={serverActions}
          >
            {children}
          </BetterAgentProvider>
        </body>
      </html>
    );
  }

Add to .env.local:

  NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY=ba_client_...

The clientKey (ba_client_...) is safe to expose publicly.
Never expose the secretKey (ba_secret_...) in client-side code.

Also import and render the chat component that betteragent init installed.
The provider supplies context but renders no UI on its own. For the sidebar
variant, add it alongside your main content:

  import { ChatSidebar } from "@/components/chat/sidebar";

  <div className="flex h-screen">
    <main className="flex-1 overflow-y-auto">{children}</main>
    <ChatSidebar title="Assistant" greeting="Hi — how can I help?" />
  </div>

---

## Tool file reference (for manual edits after discovery)

Tool files teach the agent what it can do. Three file types:

### routes.betteragent.ts — HTTP routes called server-to-server

  import { defineRoute } from "@betteragent/next";
  import { z } from "zod";

  export const getUser = defineRoute({
    name: "getUser",
    method: "GET",
    path: "/api/user",
    description: "Get the current authenticated user's profile. Use when " +
      "the user asks about their account or profile details.",
    schema: z.object({}),
  });

  export const routes = [getUser];

### server-actions.betteragent.ts — Next.js Server Actions

  import { defineServerAction } from "@betteragent/next";
  import { z } from "zod";
  import { updateProfile } from "@/app/actions/profile";

  export const updateUserProfile = defineServerAction({
    name: "updateUserProfile",
    description: "Update the user's display name and bio. Only call after " +
      "they explicitly ask to change their name.",
    schema: z.object({
      name: z.string().min(1).max(100),
      bio:  z.string().max(500).optional(),
    }),
    handler: updateProfile,
  });

  export const serverActions = [updateUserProfile];

### actions.betteragent.ts — Browser-side effects

  import { defineAction } from "@betteragent/next";
  import { z } from "zod";

  export const openModal = defineAction({
    name: "openModal",
    description: "Open a modal or dialog. Use when the user asks to see or " +
      "edit something in a dialog.",
    schema: z.object({
      name: z.enum(["settings", "profile", "billing"]),
    }),
  });

  export const actions = [openModal];

Register client actions in BetterAgentProvider:

  <BetterAgentProvider
    clientKey={...}
    endUserId={...}
    actions={{
      openModal: ({ name }) => setOpenDialog(name),
    }}
  >

---

## Key facts

- Credits: 2 per conversation start · 1 per message · 3 per tool call
- Free plan: 500 credits/30-day period, no card required
- Run betteragent sync whenever tool files change
- Better descriptions = better agent decisions
  Describe *when* to use a tool, not just *what* it does
- Docs:          https://betteragent.dev/docs
- CLI reference: https://betteragent.dev/cli
- Tool files:    https://betteragent.dev/docs/tools`;
