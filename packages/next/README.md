# betteragent-next

Define BetterAgent tools, server actions, and client actions from your Next.js app.

```bash
npm i betteragent-next zod
```

## `defineRoute`

```ts
// routes.betteragent.ts
import { z } from "zod";
import { defineRoute } from "betteragent-next";

export const listProjects = defineRoute({
  name: "listProjects",
  method: "GET",
  path: "/api/projects",
  description: "List the current user's projects.",
  schema: z.object({ q: z.string().optional() }),
});

export const routes = [listProjects];
```

## `defineServerAction`

```ts
// server-actions.betteragent.ts
"use server";
// ^ Required — makes every exported async function a real Next.js server action.

import { z } from "zod";
import { defineServerAction } from "betteragent-next";
import { createProject as _createProject } from "@/app/actions/projects";

// The export name doesn't matter — dispatch uses the `name` field.
export const createProject = defineServerAction({
  name: "createProject",
  description: "Create a project for the current user.",
  schema: z.object({ name: z.string().min(1) }),
  handler: _createProject,
});
```

Input is validated against the schema before the handler runs.

The `name` field is the tool name the agent uses to call this action. The export
name is irrelevant — `buildServerActionMap` (called in the generated
`AgentProvider`) reads the `name` field server-side before symbols are stripped
at the server/client boundary.

## `buildServerActionMap`

Converts a `"use server"` namespace import into a `{ [toolName]: handler }` map.
Call it in a **Server Component** so metadata is still intact:

```tsx
// components/betteragent-provider.tsx  (Server Component — no "use client")
import { buildServerActionMap } from "betteragent-next";
import { BetterAgentProvider } from "betteragent-react";
import * as serverActions from "@/server-actions.betteragent";

export function AgentProvider({ children, ...props }) {
  return (
    <BetterAgentProvider
      {...props}
      serverActions={buildServerActionMap(serverActions)}
    >
      {children}
    </BetterAgentProvider>
  );
}
```

The generated `AgentProvider` from `betteragent init` does this automatically.
You only need `buildServerActionMap` directly if you're wiring the provider
manually.

## `defineAction` (client actions)

```ts
// actions.betteragent.ts
import { z } from "zod";
import { defineAction } from "betteragent-next";

export const openSettings = defineAction({
  name: "openSettings",
  description: "Opens the settings modal.",
  schema: z.object({ tab: z.enum(["profile", "billing"]).optional() }),
});

export const actions = [openSettings];
```

The React SDK reads these declarations on the client and dispatches them when
the agent emits an `action_call` event.
