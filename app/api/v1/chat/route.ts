import { type NextRequest } from "next/server";
import { consumeCredits, CREDIT_WEIGHTS, hasMinimumCredits } from "@/lib/billing";
import { checkTokenCap } from "@/lib/chat/caps";
import {
  createConversation,
  loadConversationForProject,
  loadHistory,
  markConversationAbandoned,
  saveUserMessage,
} from "@/lib/chat/conversations";
import { runChatTurn } from "@/lib/chat/engine";
import {
  attachConversation,
  claimIdempotencyKey,
  type IdempotencyClaim,
} from "@/lib/chat/idempotency";
import { SSE_HEADERS } from "@/lib/chat/streaming";
import { prisma } from "@/lib/db";
import { ConversationStatus } from "@/lib/generated/prisma/enums";
import { chatRequestSchema } from "@/lib/schemas/chat";

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

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { endUserId, conversationId: requestedConvId, message, idempotencyKey } = parsed.data;

  let project: { id: string; baseUrl: string | null; systemPrompt: string | null } | null;
  try {
    project = await prisma.project.findUnique({
      where: { clientKey },
      select: { id: true, baseUrl: true, systemPrompt: true },
    });
  } catch (err) {
    console.error("[chat] project lookup failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!project) {
    return Response.json({ error: "Invalid client key" }, { status: 401 });
  }

  let claim: IdempotencyClaim | null = null;
  if (idempotencyKey) {
    claim = await claimIdempotencyKey({
      projectId: project.id,
      key: idempotencyKey,
      endpoint: "chat",
    });
    if (claim.kind === "duplicate") {
      return Response.json(
        { idempotent: true, conversationId: claim.conversationId },
        { status: 200 },
      );
    }
  }

  const hasCredits = await hasMinimumCredits(project.id, 1);
  if (!hasCredits) {
    return Response.json({ error: "Credit limit reached" }, { status: 402 });
  }

  let conversationId: string;
  if (requestedConvId) {
    const conv = await loadConversationForProject(project.id, requestedConvId);
    if (!conv) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conv.status !== ConversationStatus.active) {
      return Response.json({ error: "Conversation is no longer active" }, { status: 409 });
    }
    if (conv.endUserId !== endUserId) {
      return Response.json({ error: "endUserId does not match conversation" }, { status: 403 });
    }
    const cap = await checkTokenCap(conv.id);
    if (cap.over) {
      await markConversationAbandoned(conv.id);
      return Response.json(
        { error: "conversation token cap reached", code: "token_cap" },
        { status: 409 },
      );
    }
    conversationId = conv.id;
  } else {
    const created = await createConversation(project.id, endUserId);
    conversationId = created.id;
    const start = await consumeCredits(project.id, {
      type: "conversation_start",
      credits: CREDIT_WEIGHTS.conversation_start,
      conversationId,
    });
    if (!start.ok) {
      return Response.json({ error: "Credit limit reached" }, { status: 402 });
    }
  }

  if (claim?.kind === "fresh") {
    await attachConversation(claim.id, conversationId);
  }

  await saveUserMessage(conversationId, message.content);

  const history = await loadHistory(conversationId);

  const { stream } = runChatTurn({
    project,
    conversationId,
    endUserId,
    endUserToken: req.headers.get("x-end-user-token"),
    history,
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
