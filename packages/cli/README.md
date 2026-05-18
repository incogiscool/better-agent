# @betteragent/cli

```bash
npm i -D @betteragent/cli
```

## Commands

### `betteragent login`

```bash
npx betteragent login --key <secret> --project <projectId>
```

Verifies the credentials against the BetterAgent backend and writes them to
`~/.betteragent/credentials.json` (mode 0600). Use `BETTERAGENT_API_URL` (or
`--api-url`) to point at a different environment.

### `betteragent whoami`

Prints the currently authenticated project. Re-verifies the stored key.

### `betteragent logout`

Removes the credentials file.

### `betteragent sync`

Loads your tool files, validates them, and POSTs to `/v1/sync`. Prints the
diff (added, updated, removed, unchanged).

Tool files are TypeScript modules in your project root:

- `routes.betteragent.ts` — exports `const routes = [defineRoute(...)]`
- `server-actions.betteragent.ts` — exports `const serverActions = [defineServerAction(...)]`
- `actions.betteragent.ts` — exports `const actions = [defineAction(...)]`

All three are optional. Use `--cwd <dir>` to target a different directory and
`--dry-run` to validate without uploading.

## Optional `betteragent.config.json`

```json
{
  "apiUrl": "http://localhost:3000",
  "projectId": "...",
  "files": {
    "routes": "src/routes.betteragent.ts",
    "serverActions": "src/server-actions.betteragent.ts",
    "actions": "src/actions.betteragent.ts"
  }
}
```

Any field is optional. The CLI falls back to defaults / stored credentials /
environment variables.
