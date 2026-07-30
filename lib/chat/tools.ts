import { jsonSchema, tool, type ToolSet } from "ai";
import { prisma } from "@/lib/db";
import { assertSafeOutboundUrl } from "@/lib/net/ssrf";
import type { ToolType } from "@/lib/generated/prisma/enums";
import { ToolExecutionStatus } from "@/lib/generated/prisma/enums";
import { MAX_TOOL_RESULT_BYTES } from "./caps";
import { buildRouteRequest } from "./route-url";
import {
  insertPendingExecution,
  updateExecution,
  type ExecutionPatch,
} from "./conversations";

export type ToolMeta = {
  id: string;
  name: string;
  type: ToolType;
  version: number;
};

export type BuiltTools = {
  toolSet: ToolSet;
  meta: Map<string, ToolMeta>;
};

/**
 * Headers the SDK asked us to forward, minus anything the project hasn't opted
 * into. Cookies are the only gated header: forwarding one hands a live session
 * credential to the project's backend, so it stays off until a project owner
 * turns it on in settings.
 */
function resolveEndUserHeaders(
  endUserHeaders: Record<string, string> | null,
  endUserToken: string | null,
  allowCookieForwarding: boolean,
): Record<string, string> {
  if (endUserHeaders && Object.keys(endUserHeaders).length > 0) {
    if (allowCookieForwarding) return endUserHeaders;
    return Object.fromEntries(
      Object.entries(endUserHeaders).filter(
        ([key]) => key.toLowerCase() !== "cookie",
      ),
    );
  }
  if (endUserToken) {
    return { authorization: `Bearer ${endUserToken}` };
  }
  return {};
}

/** True when the headers carry an end-user credential we must not let leak. */
function carriesCredentials(headers: Record<string, string>): boolean {
  return Object.keys(headers).some((key) => {
    const lower = key.toLowerCase();
    return lower === "cookie" || lower === "authorization";
  });
}

/** Local development is exempt; anything else must be encrypted in transit. */
function isSecureBaseUrl(url: URL): boolean {
  return (
    url.protocol === "https:" ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  );
}

const TRUNCATION_SUFFIX = "\n[...truncated]";
const ROUTE_TIMEOUT_MS = 30_000;

function truncateText(text: string): string {
  return text.length > MAX_TOOL_RESULT_BYTES
    ? text.slice(0, MAX_TOOL_RESULT_BYTES) + TRUNCATION_SUFFIX
    : text;
}

async function executeRouteFetch(args: {
  baseUrl: string | null;
  method: string;
  path: string;
  endUserToken: string | null;
  endUserHeaders: Record<string, string> | null;
  allowCookieForwarding: boolean;
  input: unknown;
  signal: AbortSignal;
}): Promise<{ ok: boolean; status: number | null; body: unknown; raw: string }> {
  if (!args.baseUrl) {
    throw new Error("project baseUrl is not configured");
  }

  const upperMethod = args.method.toUpperCase();
  const { url, body } = buildRouteRequest({
    baseUrl: args.baseUrl,
    method: upperMethod,
    path: args.path,
    input: args.input,
  });

  // SSRF guard: reject internal/metadata targets before making the request.
  await assertSafeOutboundUrl(url);

  const endUserHeaders = resolveEndUserHeaders(
    args.endUserHeaders,
    args.endUserToken,
    args.allowCookieForwarding,
  );

  if (carriesCredentials(endUserHeaders) && !isSecureBaseUrl(new URL(url))) {
    throw new Error(
      "refusing to send end-user credentials over plain HTTP — configure an https baseUrl",
    );
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...endUserHeaders,
  };

  const res = await fetch(url, {
    method: upperMethod,
    headers,
    body,
    signal: args.signal,
    // A 3xx would otherwise hand the end user's credentials to whatever host
    // the target names. Surface the redirect as the result instead.
    redirect: carriesCredentials(endUserHeaders) ? "manual" : "follow",
  });

  const raw = await res.text();
  const truncated = truncateText(raw);

  let parsed: unknown = truncated;
  try {
    parsed = JSON.parse(truncated);
  } catch {
    // Keep as string if not JSON
  }

  return { ok: res.ok, status: res.status, body: parsed, raw };
}

export async function buildToolSet(args: {
  projectId: string;
  baseUrl: string | null;
  endUserToken: string | null;
  endUserHeaders: Record<string, string> | null;
  allowCookieForwarding: boolean;
  conversationId: string;
}): Promise<BuiltTools> {
  const dbTools = await prisma.tool.findMany({
    where: { projectId: args.projectId, deletedAt: null },
    include: { override: true },
  });

  const enabled = dbTools.filter((t) => t.override?.enabled !== false);

  const toolSet: ToolSet = {};
  const meta = new Map<string, ToolMeta>();

  for (const t of enabled) {
    const description = (t.override?.description ?? t.description ?? "").trim();

    meta.set(t.name, {
      id: t.id,
      name: t.name,
      type: t.type,
      version: t.version,
    });

    let schemaWrapper;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schemaWrapper = jsonSchema(t.inputSchema as any);
    } catch (err) {
      console.error(`[chat/tools] Invalid JSON Schema for tool "${t.name}":`, err);
      // Skip this tool entirely rather than crashing the whole turn
      meta.delete(t.name);
      continue;
    }

    if (t.type === "route") {
      const method = t.method ?? "POST";
      const path = t.path ?? "/";
      const toolId = t.id;
      const toolName = t.name;
      const toolVersion = t.version;

      toolSet[t.name] = tool({
        description,
        inputSchema: schemaWrapper,
        execute: async (input, { toolCallId, abortSignal }) => {
          const exec = await insertPendingExecution({
            conversationId: args.conversationId,
            toolId,
            toolName,
            toolCallId,
            input,
            toolVersion,
          });

          const start = Date.now();
          const ctrl = new AbortController();
          const timeout = setTimeout(() => ctrl.abort(), ROUTE_TIMEOUT_MS);
          abortSignal?.addEventListener("abort", () => ctrl.abort());

          let patch: ExecutionPatch;
          let returnValue: unknown;

          try {
            const result = await executeRouteFetch({
              baseUrl: args.baseUrl,
              method,
              path,
              endUserToken: args.endUserToken,
              endUserHeaders: args.endUserHeaders,
              allowCookieForwarding: args.allowCookieForwarding,
              input,
              signal: ctrl.signal,
            });
            patch = {
              status: result.ok ? ToolExecutionStatus.succeeded : ToolExecutionStatus.failed,
              output: result.body,
              durationMs: Date.now() - start,
              errorMessage: result.ok ? null : `HTTP ${result.status}`,
            };
            returnValue = result.body;
          } catch (err) {
            const aborted = (err as Error).name === "AbortError";
            const message = aborted ? "tool timed out" : (err as Error).message;
            patch = {
              status: aborted ? ToolExecutionStatus.timed_out : ToolExecutionStatus.failed,
              output: { error: message },
              durationMs: Date.now() - start,
              errorMessage: message,
            };
            returnValue = { error: message };
          } finally {
            clearTimeout(timeout);
          }

          await updateExecution(exec.id, patch);
          return returnValue;
        },
      });
    } else {
      // client_invocation — no execute. SDK emits tool-call, then ends the step.
      toolSet[t.name] = tool({
        description,
        inputSchema: schemaWrapper,
      });
    }
  }

  return { toolSet, meta };
}
