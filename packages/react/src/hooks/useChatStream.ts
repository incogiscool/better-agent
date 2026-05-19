"use client";

import * as React from "react";
import { ChatClientError } from "../client/ChatClient";
import { useBetterAgentContext } from "../provider/BetterAgentProvider";
import type {
  ChatError,
  ChatEvent,
  ChatMessage,
  SendOptions,
  ToolCallEntry,
  UserMessage,
} from "../types";

export type UseChatStreamOptions = {
  /**
   * Resume an existing conversation. If omitted, a new conversation is
   * created on first send.
   */
  initialConversationId?: string;
  /**
   * Optional initial messages (e.g. for rehydrating from local storage).
   */
  initialMessages?: ChatMessage[];
};

export type UseChatStreamReturn = {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  error: ChatError | null;
  /** Send a user message. */
  send: (content: string, options?: SendOptions) => Promise<void>;
  /** Abort the active stream and dispatch loop. */
  stop: () => void;
  /** Clear local message state and forget the conversationId. */
  reset: () => void;
};

type State = {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  error: ChatError | null;
};

type Action =
  | { type: "set_streaming"; value: boolean }
  | { type: "push_user"; message: UserMessage }
  | { type: "begin_assistant"; id: string }
  | { type: "append_delta"; id: string; delta: string }
  | { type: "tool_call"; assistantId: string; entry: ToolCallEntry }
  | {
      type: "tool_result";
      toolCallId: string;
      output: unknown;
      durationMs: number;
    }
  | { type: "set_conversation"; conversationId: string }
  | { type: "set_error"; error: ChatError | null }
  | { type: "finalize_assistant"; id: string }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set_streaming":
      return { ...state, isStreaming: action.value };
    case "push_user":
      return { ...state, messages: [...state.messages, action.message] };
    case "begin_assistant":
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.id,
            role: "assistant",
            content: "",
            toolCalls: [],
            createdAt: Date.now(),
            streaming: true,
          },
        ],
      };
    case "append_delta":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id && m.role === "assistant"
            ? { ...m, content: m.content + action.delta }
            : m,
        ),
      };
    case "tool_call":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.assistantId && m.role === "assistant"
            ? { ...m, toolCalls: [...m.toolCalls, action.entry] }
            : m,
        ),
      };
    case "tool_result":
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m.role !== "assistant") return m;
          const idx = m.toolCalls.findIndex(
            (t) => t.toolCallId === action.toolCallId,
          );
          if (idx === -1) return m;
          const next = [...m.toolCalls];
          const prev = next[idx]!;
          next[idx] = {
            ...prev,
            output: action.output,
            state: "succeeded",
            durationMs: action.durationMs,
          };
          return { ...m, toolCalls: next };
        }),
      };
    case "set_conversation":
      return { ...state, conversationId: action.conversationId };
    case "set_error":
      return { ...state, error: action.error };
    case "finalize_assistant":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id && m.role === "assistant"
            ? { ...m, streaming: false }
            : m,
        ),
      };
    case "reset":
      return {
        messages: [],
        conversationId: null,
        isStreaming: false,
        error: null,
      };
    default:
      return state;
  }
}

function newId(): string {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Drive a chat conversation with the BetterAgent backend.
 *
 * - Sends user messages over /api/v1/chat.
 * - Streams assistant text, tool calls, and tool results from SSE.
 * - On `action_call`, invokes the matching handler from the Provider's
 *   `actions` or `serverActions`, then attaches to the resumed stream from
 *   /api/v1/execute-result transparently.
 */
export function useChatStream(
  options: UseChatStreamOptions = {},
): UseChatStreamReturn {
  const ctx = useBetterAgentContext();
  const { client, dispatcher, onError } = ctx;

  const [state, dispatch] = React.useReducer(reducer, {
    messages: options.initialMessages ?? [],
    conversationId: options.initialConversationId ?? null,
    isStreaming: false,
    error: null,
  });

  const abortRef = React.useRef<AbortController | null>(null);
  const toolStartRef = React.useRef<Map<string, number>>(new Map());

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: "set_streaming", value: false });
  }, []);

  const reset = React.useCallback(() => {
    stop();
    dispatch({ type: "reset" });
  }, [stop]);

  const consumeStream = React.useCallback(
    async (
      stream: AsyncIterable<ChatEvent>,
      assistantId: string,
      signal: AbortSignal,
    ): Promise<void> => {
      let active = assistantId;
      let currentStream: AsyncIterable<ChatEvent> | null = stream;

      while (currentStream) {
        const next = await runOne(currentStream);
        currentStream = next;
      }

      async function runOne(
        s: AsyncIterable<ChatEvent>,
      ): Promise<AsyncIterable<ChatEvent> | null> {
        for await (const event of s) {
          if (signal.aborted) return null;

          switch (event.event) {
            case "text_delta":
              dispatch({
                type: "append_delta",
                id: active,
                delta: event.data.delta,
              });
              break;

            case "tool_call":
              toolStartRef.current.set(event.data.toolCallId, Date.now());
              dispatch({
                type: "tool_call",
                assistantId: active,
                entry: {
                  id: newId(),
                  toolCallId: event.data.toolCallId,
                  toolName: event.data.toolName,
                  input: event.data.input,
                  state: "running",
                  startedAt: Date.now(),
                },
              });
              break;

            case "tool_result": {
              const started = toolStartRef.current.get(event.data.toolCallId);
              const durationMs = started ? Date.now() - started : 0;
              toolStartRef.current.delete(event.data.toolCallId);
              dispatch({
                type: "tool_result",
                toolCallId: event.data.toolCallId,
                output: event.data.output,
                durationMs,
              });
              break;
            }

            case "action_call": {
              // Show the tool-call entry so the UI updates immediately.
              toolStartRef.current.set(event.data.toolCallId, Date.now());
              dispatch({
                type: "tool_call",
                assistantId: active,
                entry: {
                  id: newId(),
                  toolCallId: event.data.toolCallId,
                  toolName: event.data.toolName,
                  input: event.data.input,
                  state: "running",
                  startedAt: Date.now(),
                },
              });

              // conversationId is now embedded in the action_call event itself.
              const convId = event.data.conversationId;

              // Also persist it in state so the next send() picks it up.
              dispatch({ type: "set_conversation", conversationId: convId });

              try {
                const resumed = await dispatcher.dispatch({
                  conversationId: convId,
                  toolCallId: event.data.toolCallId,
                  toolName: event.data.toolName,
                  input: event.data.input,
                  signal,
                });

                const started =
                  toolStartRef.current.get(event.data.toolCallId) ?? Date.now();
                toolStartRef.current.delete(event.data.toolCallId);
                dispatch({
                  type: "tool_result",
                  toolCallId: event.data.toolCallId,
                  output: null,
                  durationMs: Date.now() - started,
                });

                // Begin a NEW assistant message for the resumed turn —
                // matches how the server treats it as a fresh turn.
                active = newId();
                dispatch({ type: "begin_assistant", id: active });
                return resumed;
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : String(err);
                dispatch({
                  type: "set_error",
                  error: { message },
                });
                return null;
              }
            }

            case "done":
              if (event.data.conversationId) {
                dispatch({
                  type: "set_conversation",
                  conversationId: event.data.conversationId,
                });
              }
              dispatch({ type: "finalize_assistant", id: active });
              return null;

            case "error":
              dispatch({
                type: "set_error",
                error: { message: event.data.message, code: event.data.code },
              });
              dispatch({ type: "finalize_assistant", id: active });
              return null;
          }
        }
        return null;
      }
    },
    [dispatcher],
  );

  const send = React.useCallback(
    async (content: string, sendOpts: SendOptions = {}) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      if (state.isStreaming) return;

      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: UserMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      const assistantId = newId();

      dispatch({ type: "push_user", message: userMessage });
      dispatch({ type: "begin_assistant", id: assistantId });
      dispatch({ type: "set_streaming", value: true });
      dispatch({ type: "set_error", error: null });

      try {
        const stream = await client.startChat({
          message: trimmed,
          conversationId: state.conversationId ?? undefined,
          idempotencyKey: sendOpts.idempotencyKey,
          signal: controller.signal,
        });
        await consumeStream(stream, assistantId, controller.signal);
      } catch (err) {
        const error: ChatError =
          err instanceof ChatClientError
            ? { message: err.message, code: err.code }
            : { message: err instanceof Error ? err.message : String(err) };
        dispatch({ type: "set_error", error });
        dispatch({ type: "finalize_assistant", id: assistantId });
        onError?.(error);
      } finally {
        dispatch({ type: "set_streaming", value: false });
        abortRef.current = null;
      }
    },
    [
      consumeStream,
      client,
      onError,
      state.conversationId,
      state.isStreaming,
    ],
  );

  // Abort on unmount.
  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    messages: state.messages,
    conversationId: state.conversationId,
    isStreaming: state.isStreaming,
    error: state.error,
    send,
    stop,
    reset,
  };
}
