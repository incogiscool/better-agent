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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export async function POST(req: NextRequest) {
  const clientKey = extractBearerToken(req);
  if (!clientKey) {
    return Response.json(
      { error: "Missing Authorization header. Expected: Bearer <client_key>" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = executeResultRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { conversationId, toolCallId, output, error } = parsed.data;

  let project: { id: string; baseUrl: string | null; systemPrompt: string | null } | null;
  try {
    project = await prisma.project.findUnique({
      where: { clientKey },
      select: { id: true, baseUrl: true, systemPrompt: true },
    });
  } catch (err) {
    console.error("[execute-result] project lookup failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!project) {
    return Response.json({ error: "Invalid client key" }, { status: 401 });
  }

  const conv = await loadConversationForProject(project.id, conversationId);
  if (!conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conv.status !== ConversationStatus.active) {
    return Response.json({ error: "Conversation is no longer active" }, { status: 409 });
  }

  const exec = await prisma.toolExecution.findFirst({
    where: { conversationId: conv.id, toolCallId },
    select: { id: true, status: true, createdAt: true },
  });
  if (!exec) {
    return Response.json({ error: "No matching tool execution" }, { status: 404 });
  }
  if (exec.status !== ToolExecutionStatus.pending) {
    return Response.json({ error: "Tool execution already resolved" }, { status: 409 });
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
    return Response.json({ error: "Credit limit reached" }, { status: 402 });
  }

  const cap = await checkTokenCap(conv.id);
  if (cap.over) {
    await markConversationAbandoned(conv.id);
    return Response.json(
      { error: "conversation token cap reached", code: "token_cap" },
      { status: 409 },
    );
  }

  const history = await loadHistory(conv.id);

  const { stream } = runChatTurn({
    project,
    conversationId: conv.id,
    endUserId: conv.endUserId,
    endUserToken: req.headers.get("x-end-user-token"),
    history,
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
