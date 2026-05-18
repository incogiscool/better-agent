# @betteragent/next

Define BetterAgent tools, server actions, and client actions from your Next.js app.

```bash
npm i @betteragent/next zod
```

## `defineRoute`

```ts
// routes.betteragent.ts
import { z } from "zod";
import { defineRoute } from "@betteragent/next";

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

import { z } from "zod";
import { defineServerAction } from "@betteragent/next";

export const createProject = defineServerAction({
  name: "createProject",
  description: "Create a project for the current user.",
  schema: z.object({ name: z.string().min(1) }),
  async handler({ name }) {
    // ... your normal server action body
  },
});

export const serverActions = [createProject];
```

The wrapped function is callable like your original handler. When you pass a
Zod schema, input is validated before the handler runs.

## `defineAction` (client actions)

```ts
// actions.betteragent.ts
import { z } from "zod";
import { defineAction } from "@betteragent/next";

export const openSettings = defineAction({
  name: "openSettings",
  description: "Opens the settings modal.",
  schema: z.object({ tab: z.enum(["profile", "billing"]).optional() }),
});

export const actions = [openSettings];
```

The React SDK (coming separately) reads these declarations on the client and
dispatches them when the agent emits an `action_call` event.
