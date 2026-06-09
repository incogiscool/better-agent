import { TOOL_METADATA } from "betteragent-next";
import type { ActionHandler, ActionRegistry } from "../types.js";
import { ChatClient } from "./ChatClient.js";

export type Dispatcher = {
  resolve(toolName: string): ActionHandler | null;
  dispatch(args: {
    conversationId: string;
    toolCallId: string;
    toolName: string;
    input: unknown;
    signal?: AbortSignal;
  }): Promise<AsyncIterable<import("../types.js").ChatEvent>>;
};

export type DispatcherInputs = {
  client: ChatClient;
  actions?: ActionRegistry;
  serverActions?: readonly unknown[] | Record<string, ActionHandler>;
};

/**
 * Build a dispatcher that knows about both:
 * - `actions`: a name-keyed map of client-only handlers (modal toggles, etc.)
 * - `serverActions`: callables returned by `defineServerAction` from
 *   `betteragent-next`. Each carries its metadata under the `TOOL_METADATA`
 *   symbol so we can recover its `name` and call the function directly.
 *
 * Lookup order: client actions first, then server actions. This matches the
 * design doc's "client overrides server when both registered."
 */
export function buildDispatcher(inputs: DispatcherInputs): Dispatcher {
  const serverByName = collectServerActions(inputs.serverActions);

  function resolve(toolName: string): ActionHandler | null {
    if (inputs.actions && toolName in inputs.actions) {
      return inputs.actions[toolName] ?? null;
    }
    return serverByName[toolName] ?? null;
  }

  async function dispatch(args: {
    conversationId: string;
    toolCallId: string;
    toolName: string;
    input: unknown;
    signal?: AbortSignal;
  }) {
    const handler = resolve(args.toolName);

    if (!handler) {
      return inputs.client.executeResult({
        conversationId: args.conversationId,
        toolCallId: args.toolCallId,
        error: `No handler registered for tool "${args.toolName}".`,
        signal: args.signal,
      });
    }

    try {
      const output = await handler(args.input);
      return await inputs.client.executeResult({
        conversationId: args.conversationId,
        toolCallId: args.toolCallId,
        output: output ?? null,
        signal: args.signal,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return await inputs.client.executeResult({
        conversationId: args.conversationId,
        toolCallId: args.toolCallId,
        error: message,
        signal: args.signal,
      });
    }
  }

  return { resolve, dispatch };
}

function collectServerActions(
  input: DispatcherInputs["serverActions"],
): Record<string, ActionHandler> {
  if (!input) return {};

  // Both the array form and the namespace/record form (e.g.
  // `import * as serverActions`) carry `defineServerAction` callables tagged
  // with TOOL_METADATA. Key by the metadata `name` (the *tool* name) rather
  // than the object key, because the export name usually differs from the tool
  // name (e.g. `export const createTaskActionAction = defineServerAction({
  // name: "createTaskAction" })`). Keying by export name would make
  // resolve("createTaskAction") miss and post "No handler registered".
  const entries = Array.isArray(input) ? input : Object.values(input);
  const out: Record<string, ActionHandler> = {};
  for (const entry of entries) {
    const meta = readMetadata(entry);
    if (meta && typeof entry === "function") {
      out[meta.name] = entry as ActionHandler;
    }
  }

  // Fallback: a plain, manually-built name-keyed map (no metadata-tagged
  // values) is a documented form — use it directly.
  if (Object.keys(out).length === 0 && !Array.isArray(input)) {
    return input as Record<string, ActionHandler>;
  }

  return out;
}

function readMetadata(value: unknown): { name: string } | null {
  if (value == null) return null;
  if (typeof value !== "object" && typeof value !== "function") return null;
  const meta = (value as Record<symbol, unknown>)[TOOL_METADATA];
  if (
    meta &&
    typeof meta === "object" &&
    "name" in meta &&
    typeof (meta as { name: unknown }).name === "string"
  ) {
    return meta as { name: string };
  }
  return null;
}
