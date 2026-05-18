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
 * Wrap a Next.js Server Action so the chat engine can dispatch it via the
 * client SDK. The returned function is callable like the original handler;
 * when the schema is a Zod schema, input is validated before the handler
 * runs.
 */
export function defineServerAction<TInput, TOutput>(
  opts: ServerActionOptions<TInput, TOutput>,
): ServerActionDefinition<TInput, TOutput> {
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
