import { TOOL_METADATA } from "./symbols";
import type {
  ClientActionDefinition,
  ClientActionOptions,
  RouteDefinition,
  RouteOptions,
  ServerActionDefinition,
  ServerActionOptions,
} from "./types";
import { safeValidateInput, toJsonSchema } from "./schema";

/**
 * Declare an HTTP route as a BetterAgent tool. The chat engine performs
 * server-to-server fetch calls against `baseUrl + path`.
 *
 * ```ts
 * export const listProjects = defineRoute({
 *   name: "listProjects",
 *   method: "GET",
 *   path: "/api/projects",
 *   description: "List the current user's projects.",
 *   schema: z.object({ q: z.string().optional() }),
 * });
 * ```
 */
export function defineRoute<TInput>(
  opts: RouteOptions<TInput>,
): RouteDefinition {
  const def: RouteDefinition = {
    kind: "route",
    name: opts.name,
    method: opts.method,
    path: opts.path,
    description: opts.description,
    schema: toJsonSchema(opts.schema),
  };
  // Also expose the metadata via the discovery symbol so CLI loaders can pick
  // up either pattern (named export of metadata, or call-time wrap).
  Object.defineProperty(def, TOOL_METADATA, {
    value: def,
    enumerable: false,
    writable: false,
  });
  return def;
}

/**
 * True when `fn` is a real Next.js Server Action reference — i.e. a function
 * imported from a `"use server"` module. React tags those with the
 * `react.server.reference` symbol. Inline async functions are NOT tagged.
 */
function isServerReference(fn: unknown): boolean {
  return (
    typeof fn === "function" &&
    (fn as { $$typeof?: symbol }).$$typeof === Symbol.for("react.server.reference")
  );
}

/**
 * Warn (in the browser, outside production) when a handler isn't a real Server
 * Action reference. Such a handler runs client-side with no server session or
 * auth — a silent footgun. We warn rather than throw to avoid false positives
 * across bundler/runtime quirks.
 */
function warnIfClientSideHandler(name: string, handler: unknown): void {
  // Only meaningful in the browser bundle. Read `window` off globalThis so this
  // file doesn't depend on the DOM lib being in tsconfig.
  const inBrowser = typeof (globalThis as { window?: unknown }).window !== "undefined";
  if (!inBrowser) return;
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") return;
  if (isServerReference(handler)) return;
  console.warn(
    `[betteragent] defineServerAction("${name}"): handler is not a Next.js Server ` +
      `Action reference, so it will run in the browser with no server session or auth. ` +
      `Import the handler from a file with "use server" at the top instead of defining it inline.`,
  );
}

/**
 * Wrap a Next.js Server Action so the chat engine can dispatch it via the
 * client SDK. The handler MUST be a reference to a function exported from a
 * `"use server"` module — an inline handler will silently run client-side.
 * The returned function is callable like the original handler; when the schema
 * is a Zod schema, input is validated before the handler runs.
 */
export function defineServerAction<TInput, TOutput>(
  opts: ServerActionOptions<TInput, TOutput>,
): ServerActionDefinition<TInput, TOutput> {
  warnIfClientSideHandler(opts.name, opts.handler);

  const metadata = {
    kind: "server_action" as const,
    name: opts.name,
    description: opts.description,
    schema: toJsonSchema(opts.schema),
  };

  const wrapped = (async (input: TInput) => {
    const result = safeValidateInput(opts.schema, input);
    if (!result.ok) {
      throw new Error(`[${opts.name}] ${result.message}`);
    }
    return opts.handler(result.value);
  }) as ServerActionDefinition<TInput, TOutput>;

  // Expose metadata both via a named property (introspection) and via the
  // registered symbol (CLI discovery across module boundaries).
  Object.defineProperty(wrapped, "betteragent", {
    value: metadata,
    enumerable: false,
    writable: false,
  });
  Object.defineProperty(wrapped, TOOL_METADATA, {
    value: metadata,
    enumerable: false,
    writable: false,
  });

  return wrapped;
}

/**
 * Build a `{ [toolName]: handler }` map from a "use server" namespace import.
 * Call this in a Server Component so TOOL_METADATA symbols are still present —
 * they are stripped when server action references cross to the client.
 *
 * ```ts
 * // betteragent-provider.tsx  (Server Component — no "use client")
 * import * as serverActions from "./server-actions.betteragent";
 * const map = buildServerActionMap(serverActions);
 * return <BetterAgentProvider serverActions={map} ...>
 * ```
 */
export function buildServerActionMap(
  mod: Record<string, unknown>,
): Record<string, (...args: unknown[]) => Promise<unknown>> {
  const out: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
  for (const value of Object.values(mod)) {
    if (typeof value !== "function") continue;
    const meta = (value as unknown as Record<symbol, unknown>)[TOOL_METADATA];
    if (
      meta &&
      typeof meta === "object" &&
      "name" in meta &&
      typeof (meta as { name: unknown }).name === "string"
    ) {
      out[(meta as { name: string }).name] = value as (
        ...args: unknown[]
      ) => Promise<unknown>;
    }
  }
  return out;
}

/**
 * Declare a client-side action — a pure browser effect like opening a modal,
 * navigating, or refreshing UI. The agent emits an `action_call` event and the
 * React SDK dispatches it locally.
 */
export function defineAction<TInput>(
  opts: ClientActionOptions<TInput>,
): ClientActionDefinition {
  const def: ClientActionDefinition = {
    kind: "client_action",
    name: opts.name,
    description: opts.description,
    schema: toJsonSchema(opts.schema),
  };
  Object.defineProperty(def, TOOL_METADATA, {
    value: def,
    enumerable: false,
    writable: false,
  });
  return def;
}
