# betteragent-cli

```bash
npm i -D betteragent-cli
```

## Commands

### `betteragent login`

```bash
npx betteragent login --key <secret>
```

Verifies the credentials against the BetterAgent backend and writes them to
`~/.betteragent/credentials.json` (mode 0600). Use `BETTERAGENT_API_URL` (or
`--api-url`) to point at a different environment.

### `betteragent init`

First-time setup wizard. Installs a chat component variant, scaffolds tool
files, generates `components/betteragent-provider.tsx` (the `AgentProvider`
wrapper), and writes `NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY` to `.env.local`.

### `betteragent discover`

Scans your codebase for route handlers and server actions and generates the
three tool files. Shows an interactive multiselect so you can choose exactly
which routes and actions to expose.

### `betteragent whoami`

Prints the currently authenticated project. Re-verifies the stored key.

### `betteragent logout`

Removes the credentials file.

### `betteragent sync`

Loads your tool files, validates them, and POSTs to `/v1/sync`. Prints the
diff (added, updated, removed, unchanged).

Tool files live in your project root:

- `routes.betteragent.ts` — exports `const routes = [defineRoute(...)]`
- `server-actions.betteragent.ts` — `"use server"` file, individual named exports
- `actions.betteragent.ts` — exports `const actions = [defineAction(...)]`

All three are optional. Use `--cwd <dir>` to target a different directory and
`--dry-run` to validate without uploading.

## `server-actions.betteragent.ts` format

This file is a `"use server"` module. Next.js requires that `"use server"`
files only export async functions — no arrays. Export each action individually:

```ts
"use server";

import { z } from "zod";
import { defineServerAction } from "betteragent-next";
import { createProject as _createProject } from "@/app/actions/projects";

export const createProject = defineServerAction({
  name: "createProject",
  description: "...",
  schema: z.object({ name: z.string() }),
  handler: _createProject,
});
```

**The export name doesn't matter.** The agent calls tools by the `name` field.
The generated `AgentProvider` uses `buildServerActionMap` in a Server Component
to build the `{ toolName → handler }` mapping before passing it to the client,
so the mapping is always derived from `name`, not the export identifier.

## Generated `components/betteragent-provider.tsx`

`betteragent init` generates this file. It is a **Server Component** — there is
no `"use client"` directive. It calls `buildServerActionMap` from `betteragent-next`
to convert the `"use server"` namespace import into a tool-name-keyed map, then
passes it to `BetterAgentProvider` (which is the actual Client Component):

```tsx
import { buildServerActionMap } from "betteragent-next";
import { BetterAgentProvider } from "betteragent-react";
import * as serverActions from "../server-actions.betteragent";

export function AgentProvider({ children, clientKey, endUserId, ...props }) {
  return (
    <BetterAgentProvider
      clientKey={clientKey}
      endUserId={endUserId}
      serverActions={buildServerActionMap(serverActions)}
      {...props}
    >
      {children}
    </BetterAgentProvider>
  );
}
```

You never need to import `server-actions.betteragent.ts` in your layout — the
generated `AgentProvider` handles that.

## Optional `betteragent.config.json`

```json
{
  "apiUrl": "http://localhost:3000",
  "projectId": "...",
  "files": {
    "routes":        "src/routes.betteragent.ts",
    "serverActions": "src/server-actions.betteragent.ts",
    "actions":       "src/actions.betteragent.ts",
    "provider":      "src/components/betteragent-provider.tsx"
  }
}
```

Any field is optional. The CLI falls back to defaults / stored credentials /
environment variables.
