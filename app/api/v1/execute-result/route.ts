import { type NextRequest } from "next/server";
import { hasMinimumCredits } from "@/lib/billing";
import { checkTokenCap, truncateTo8KB } from "@/lib/chat/caps";
import {
  loadConversationForProject,
  loadHistory,
  markConversationAbandoned,
  saveToolResultMessage,
} from "@/lib/chat/conversations";
import { runChatTurn } from "@/lib/chat/engine";
import { SSE_HEADERS } from "@/lib/chat/streaming";
import { prisma } from "@/lib/db";
import {
  ConversationStatus,
  ToolExecutionStatus,
} from "@/lib/generated/prisma/enums";
import { executeResultRequestSchema } from "@/lib/schemas/chat";
import { corsHeaders, isOriginAllowed } from "@/lib/projects/origins";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

/** CORS preflight. Auth/origin are enforced on the actual POST. */
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status: number) =>
    Response.json(body, { status, headers: cors });

  const clientKey = extractBearerToken(req);
  if (!clientKey) {
    return json(
      { error: "Missing Authorization header. Expected: Bearer <client_key>" },
      401,
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = executeResultRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Invalid request body", issues: parsed.error.issues }, 422);
  }

  const { conversationId, toolCallId, output, error } = parsed.data;

  let project:
    | { id: string; baseUrl: string | null; systemPrompt: string | null; allowedOrigins: string[] }
    | null;
  try {
    project = await prisma.project.findUnique({
      where: { clientKey },
      select: { id: true, baseUrl: true, systemPrompt: true, allowedOrigins: true },
    });
  } catch (err) {
    console.error("[execute-result] project lookup failed:", err);
    return json({ error: "Internal server error" }, 500);
  }

  if (!project) {
    return json({ error: "Invalid client key" }, 401);
  }

  // Browser origin allowlist. Empty list => allow all (project not locked down).
  if (!isOriginAllowed(req.headers.get("origin"), project.allowedOrigins)) {
    return json({ error: "Origin not allowed" }, 403);
  }

  const conv = await loadConversationForProject(project.id, conversationId);
  if (!conv) {
    return json({ error: "Conversation not found" }, 404);
  }
  if (conv.status !== ConversationStatus.active) {
    return json({ error: "Conversation is no longer active" }, 409);
  }

  const exec = await prisma.toolExecution.findFirst({
    where: { conversationId: conv.id, toolCallId },
    select: { id: true, status: true, createdAt: true },
  });
  if (!exec) {
    return json({ error: "No matching tool execution" }, 404);
  }
  if (exec.status !== ToolExecutionStatus.pending) {
    return json({ error: "Tool execution already resolved" }, 409);
  }

  const isError = error !== undefined;
  const truncated = truncateTo8KB(isError ? { error } : output);

  await prisma.toolExecution.update({
    where: { id: exec.id },
    data: {
      status: isError ? ToolExecutionStatus.failed : ToolExecutionStatus.succeeded,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output: truncated as any,
      durationMs: Date.now() - exec.createdAt.getTime(),
      errorMessage: isError ? error : null,
    },
  });

  await saveToolResultMessage(conv.id, toolCallId, truncated);

  const hasCredits = await hasMinimumCredits(project.id, 1);
  if (!hasCredits) {
    return json({ error: "Credit limit reached" }, 402);
  }

  const cap = await checkTokenCap(conv.id);
  if (cap.over) {
    await markConversationAbandoned(conv.id);
    return json({ error: "conversation token cap reached", code: "token_cap" }, 409);
  }

  const history = await loadHistory(conv.id);

  let endUserHeaders: Record<string, string> | null = null;
  const endUserHeadersRaw = req.headers.get("x-end-user-headers");
  if (endUserHeadersRaw) {
    try {
      const parsedHeaders = JSON.parse(endUserHeadersRaw);
      if (parsedHeaders && typeof parsedHeaders === "object" && !Array.isArray(parsedHeaders)) {
        endUserHeaders = parsedHeaders as Record<string, string>;
      }
    } catch {
      // malformed — ignore and fall through to endUserToken
    }
  }

  const { stream } = runChatTurn({
    project,
    conversationId: conv.id,
    endUserId: conv.endUserId,
    endUserToken: req.headers.get("x-end-user-token"),
    endUserHeaders,
    history,
  });

  return new Response(stream, { headers: { ...cors, ...SSE_HEADERS } });
}
