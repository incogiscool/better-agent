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

  if (Array.isArray(input)) {
    const out: Record<string, ActionHandler> = {};
    for (const entry of input) {
      const meta = readMetadata(entry);
      if (meta && typeof entry === "function") {
        out[meta.name] = entry as ActionHandler;
      }
    }
    return out;
  }

  return input as Record<string, ActionHandler>;
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
