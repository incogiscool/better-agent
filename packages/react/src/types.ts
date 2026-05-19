/**
 * Public type surface for `@betteragent/react`.
 *
 * `ChatEvent` mirrors the server's `SseEvent` from `lib/chat/streaming.ts`.
 * Keep them in sync.
 */

export type ChatEvent =
  | { event: "text_delta"; data: { delta: string } }
  | {
      event: "tool_call";
      data: { toolCallId: string; toolName: string; input: unknown };
    }
  | {
      event: "tool_result";
      data: { toolCallId: string; toolName: string; output: unknown };
    }
  | {
      event: "action_call";
      data: { toolCallId: string; toolName: string; input: unknown; conversationId: string };
    }
  | { event: "done"; data: { conversationId: string } }
  | { event: "error"; data: { message: string; code?: string } };

export type ToolCallState = "running" | "succeeded" | "failed";

export type ToolCallEntry = {
  id: string;
  toolCallId: string;
  toolName: string;
  input: unknown;
  output?: unknown;
  error?: string;
  state: ToolCallState;
  startedAt: number;
  durationMs?: number;
};

export type UserMessage = {
  id: string;
  role: "user";
  content: string;
  createdAt: number;
};

export type AssistantMessage = {
  id: string;
  role: "assistant";
  content: string;
  toolCalls: ToolCallEntry[];
  createdAt: number;
  /** True while text is still streaming in for this message. */
  streaming?: boolean;
};

export type ChatMessage = UserMessage | AssistantMessage;

export type ChatError = {
  message: string;
  code?: string;
};

/**
 * A client-side handler for a `client_invocation` tool. The agent emits
 * `action_call`; the SDK looks up the handler by `toolName`, invokes it with
 * the validated input, and posts the result back to /v1/execute-result.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionHandler = (input: any) => Promise<unknown> | unknown;

export type ActionRegistry = Record<string, ActionHandler>;

export type BetterAgentConfig = {
  clientKey: string;
  apiUrl?: string;
  endUserId: string;
  /**
   * Client actions: pure browser effects (open modal, navigate, refresh).
   * Keyed by tool name.
   */
  actions?: ActionRegistry;
  /**
   * Server actions wrapped by `defineServerAction` from `@betteragent/next`.
   * Either array form (each callable carries metadata) or a name-keyed map.
   */
  serverActions?: readonly unknown[] | Record<string, ActionHandler>;
  onError?: (error: ChatError) => void;
};

export type SendOptions = {
  /**
   * Override the auto-generated idempotency key. Useful for resend-on-retry
   * UX where the same logical request should be safe to send multiple times.
   */
  idempotencyKey?: string;
};
