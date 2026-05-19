export {
  BetterAgentProvider,
  useBetterAgentContext,
} from "./provider/BetterAgentProvider";
export type { BetterAgentProviderProps } from "./provider/BetterAgentProvider";

export { useChatStream } from "./hooks/useChatStream";
export type {
  UseChatStreamOptions,
  UseChatStreamReturn,
} from "./hooks/useChatStream";
export { useBetterAgent } from "./hooks/useBetterAgent";
export type { UseBetterAgentReturn } from "./hooks/useBetterAgent";
export { useToolCall } from "./hooks/useToolCall";

export { ChatClient, ChatClientError } from "./client/ChatClient";
export type { ChatClientOptions, StartChatOptions } from "./client/ChatClient";
export { buildDispatcher } from "./client/dispatch";
export type { Dispatcher } from "./client/dispatch";
export { parseSseStream } from "./client/sse";

export { cn } from "./utils/cn";
export { newIdempotencyKey } from "./utils/idempotency";

export type {
  ChatEvent,
  ChatMessage,
  UserMessage,
  AssistantMessage,
  ToolCallEntry,
  ToolCallState,
  ChatError,
  ActionHandler,
  ActionRegistry,
  BetterAgentConfig,
  SendOptions,
} from "./types";
