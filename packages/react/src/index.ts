export {
  BetterAgentProvider,
  useBetterAgentContext,
} from "./provider/BetterAgentProvider.js";
export type { BetterAgentProviderProps } from "./provider/BetterAgentProvider.js";

export { useChatStream } from "./hooks/useChatStream.js";
export type {
  UseChatStreamOptions,
  UseChatStreamReturn,
} from "./hooks/useChatStream.js";
export { useBetterAgent } from "./hooks/useBetterAgent.js";
export type { UseBetterAgentReturn } from "./hooks/useBetterAgent.js";
export { useToolCall } from "./hooks/useToolCall.js";

export { ChatClient, ChatClientError } from "./client/ChatClient.js";
export type { ChatClientOptions, StartChatOptions } from "./client/ChatClient.js";
export { buildDispatcher } from "./client/dispatch.js";
export type { Dispatcher } from "./client/dispatch.js";
export { parseSseStream } from "./client/sse.js";

export { cn } from "./utils/cn.js";
export { newIdempotencyKey } from "./utils/idempotency.js";

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
  AuthTokenInput,
  BetterAgentConfig,
  SendOptions,
} from "./types.js";
