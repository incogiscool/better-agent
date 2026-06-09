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
import { chatLimiter, chatProjectLimiter, checkRateLimit } from "@/lib/ratelimit";
import { corsHeaders, isOriginAllowed } from "@/lib/projects/origins";
import { createHash } from "node:crypto";

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

/**
 * Per-end-user rate-limit key. Prefer the forwarded end-user token (a caller
 * can't forge another user's token), falling back to the client-asserted
 * endUserId. Hashed so raw tokens never land in Redis keys.
 */
function endUserRateKey(clientKey: string, endUserToken: string | null, endUserId: string): string {
  const subject = endUserToken
    ? `tok:${createHash("sha256").update(endUserToken).digest("base64url").slice(0, 24)}`
    : `uid:${endUserId}`;
  return `chat:${clientKey}:${subject}`;
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status: number, headers?: Record<string, string>) =>
    Response.json(body, { status, headers: { ...cors, ...headers } });
  const rateLimited = (reset: number) =>
    json({ error: "Rate limit exceeded" }, 429, {
      "Retry-After": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
    });

  const clientKey = extractBearerToken(req);
  if (!clientKey) {
    return json(
      { error: "Missing Authorization header. Expected: Bearer <client_key>" },
      401,
    );
  }

  // Cheap project-wide ceiling first, before any DB work. Bounds total spend
  // per project even across many (or spoofed) end users.
  const projectRl = await checkRateLimit(chatProjectLimiter, `chat-proj:${clientKey}`);
  if (projectRl.limited) return rateLimited(projectRl.reset);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Invalid request body", issues: parsed.error.issues }, 422);
  }

  const { endUserId, conversationId: requestedConvId, message, idempotencyKey } = parsed.data;

  // Per-end-user fairness limit so one user can't starve the project. Keyed by
  // the forwarded end-user token when present (forge-resistant), else endUserId.
  const endUserToken = req.headers.get("x-end-user-token");
  const endUserHeadersRaw = req.headers.get("x-end-user-headers");
  let endUserHeaders: Record<string, string> | null = null;
  if (endUserHeadersRaw) {
    try {
      const parsed = JSON.parse(endUserHeadersRaw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        endUserHeaders = parsed as Record<string, string>;
      }
    } catch {
      // malformed — ignore and fall through to endUserToken
    }
  }

  const userRl = await checkRateLimit(
    chatLimiter,
    endUserRateKey(clientKey, endUserToken, endUserId),
  );
  if (userRl.limited) return rateLimited(userRl.reset);

  let project:
    | { id: string; baseUrl: string | null; systemPrompt: string | null; allowedOrigins: string[] }
    | null;
  try {
    project = await prisma.project.findUnique({
      where: { clientKey },
      select: { id: true, baseUrl: true, systemPrompt: true, allowedOrigins: true },
    });
  } catch (err) {
    console.error("[chat] project lookup failed:", err);
    return json({ error: "Internal server error" }, 500);
  }

  if (!project) {
    return json({ error: "Invalid client key" }, 401);
  }

  // Browser origin allowlist. Empty list => allow all (project not locked down).
  if (!isOriginAllowed(req.headers.get("origin"), project.allowedOrigins)) {
    return json({ error: "Origin not allowed" }, 403);
  }

  let claim: IdempotencyClaim | null = null;
  if (idempotencyKey) {
    claim = await claimIdempotencyKey({
      projectId: project.id,
      key: idempotencyKey,
      endpoint: "chat",
    });
    if (claim.kind === "duplicate") {
      return json({ idempotent: true, conversationId: claim.conversationId }, 200);
    }
  }

  const hasCredits = await hasMinimumCredits(project.id, 1);
  if (!hasCredits) {
    return json({ error: "Credit limit reached" }, 402);
  }

  let conversationId: string;
  if (requestedConvId) {
    const conv = await loadConversationForProject(project.id, requestedConvId);
    if (!conv) {
      return json({ error: "Conversation not found" }, 404);
    }
    if (conv.status !== ConversationStatus.active) {
      return json({ error: "Conversation is no longer active" }, 409);
    }
    if (conv.endUserId !== endUserId) {
      return json({ error: "endUserId does not match conversation" }, 403);
    }
    const cap = await checkTokenCap(conv.id);
    if (cap.over) {
      await markConversationAbandoned(conv.id);
      return json({ error: "conversation token cap reached", code: "token_cap" }, 409);
    }
    conversationId = conv.id;
  } else {
    // New conversation. endUserId is client-asserted (see chatRequestSchema):
    // the project-wide ceiling above bounds abuse, and any per-user data the
    // agent touches via route tools is gated by the forwarded end-user token,
    // not this id.
    const created = await createConversation(project.id, endUserId);
    conversationId = created.id;
    const start = await consumeCredits(project.id, {
      type: "conversation_start",
      credits: CREDIT_WEIGHTS.conversation_start,
      conversationId,
    });
    if (!start.ok) {
      return json({ error: "Credit limit reached" }, 402);
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
    endUserToken,
    endUserHeaders,
    history,
  });

  return new Response(stream, { headers: { ...cors, ...SSE_HEADERS } });
}
