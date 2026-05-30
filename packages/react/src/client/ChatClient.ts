import type { ChatEvent } from "../types";
import { newIdempotencyKey } from "../utils/idempotency";
import { parseSseStream } from "./sse";

/**
 * Resolves the end-user auth token. Either a static string or a (possibly
 * async) getter, so the host app can return a fresh token per request. The
 * token is forwarded verbatim to route tools as their `Authorization` header,
 * so it should be whatever your backend expects to authenticate the end user.
 */
export type AuthTokenInput =
  | string
  | (() => string | null | undefined | Promise<string | null | undefined>);

export type ChatClientOptions = {
  clientKey: string;
  apiUrl?: string;
  endUserId: string;
  authToken?: AuthTokenInput;
  fetch?: typeof fetch;
};

export type StartChatOptions = {
  message: string;
  conversationId?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
};

export type ExecuteResultOptions =
  | {
      conversationId: string;
      toolCallId: string;
      output: unknown;
      signal?: AbortSignal;
    }
  | {
      conversationId: string;
      toolCallId: string;
      error: string;
      signal?: AbortSignal;
    };

const DEFAULT_API_URL = "https://api.betteragent.dev";

export class ChatClientError extends Error {
  status: number;
  data: unknown;
  code?: string;

  constructor(message: string, status: number, data: unknown, code?: string) {
    super(message);
    this.name = "ChatClientError";
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

/**
 * Thin protocol client. Knows how to:
 * - POST /api/v1/chat and parse the SSE stream
 * - POST /api/v1/execute-result and parse the resumed SSE stream
 *
 * It does NOT manage message state, retries, or action dispatch — those live
 * in `useChatStream`.
 */
export class ChatClient {
  readonly apiUrl: string;
  private readonly clientKey: string;
  private readonly endUserId: string;
  private authToken?: AuthTokenInput;
  private readonly fetcher: typeof fetch;

  constructor(options: ChatClientOptions) {
    if (!options.clientKey) throw new Error("ChatClient: clientKey is required");
    if (!options.endUserId) throw new Error("ChatClient: endUserId is required");

    this.clientKey = options.clientKey;
    this.endUserId = options.endUserId;
    this.authToken = options.authToken;
    this.apiUrl = (options.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, "");
    this.fetcher = options.fetch ?? fetch.bind(globalThis);
  }

  /**
   * Update the end-user auth token source. Lets a long-lived client pick up a
   * new token (e.g. after sign-in) without being recreated.
   */
  setAuthToken(authToken?: AuthTokenInput): void {
    this.authToken = authToken;
  }

  private async resolveAuthToken(): Promise<string | null> {
    const source = this.authToken;
    if (!source) return null;
    const value = typeof source === "function" ? await source() : source;
    return value ? value : null;
  }

  async startChat(opts: StartChatOptions): Promise<AsyncIterable<ChatEvent>> {
    const body = {
      endUserId: this.endUserId,
      message: { content: opts.message },
      conversationId: opts.conversationId,
      idempotencyKey: opts.idempotencyKey ?? newIdempotencyKey(),
    };

    const res = await this.fetcher(`${this.apiUrl}/api/v1/chat`, {
      method: "POST",
      headers: await this.buildHeaders(),
      body: JSON.stringify(body),
      signal: opts.signal,
    });

    return this.handleStreamResponse(res, opts.signal);
  }

  async executeResult(opts: ExecuteResultOptions): Promise<AsyncIterable<ChatEvent>> {
    const body =
      "error" in opts
        ? {
            conversationId: opts.conversationId,
            toolCallId: opts.toolCallId,
            error: opts.error,
          }
        : {
            conversationId: opts.conversationId,
            toolCallId: opts.toolCallId,
            output: opts.output,
          };

    const res = await this.fetcher(`${this.apiUrl}/api/v1/execute-result`, {
      method: "POST",
      headers: await this.buildHeaders(),
      body: JSON.stringify(body),
      signal: opts.signal,
    });

    return this.handleStreamResponse(res, opts.signal);
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.clientKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    // Forward the end-user's auth token so route tools can call the host
    // backend as the logged-in user. Without it, route tools hit the host
    // backend unauthenticated.
    const endUserToken = await this.resolveAuthToken();
    if (endUserToken) headers["x-end-user-token"] = endUserToken;
    return headers;
  }

  private async handleStreamResponse(
    res: Response,
    signal?: AbortSignal,
  ): Promise<AsyncIterable<ChatEvent>> {
    if (!res.ok) {
      let data: unknown = null;
      let message = `HTTP ${res.status} ${res.statusText}`;
      let code: string | undefined;
      try {
        data = await res.json();
        if (data && typeof data === "object") {
          if ("error" in data && typeof (data as { error: unknown }).error === "string") {
            message = (data as { error: string }).error;
          }
          if ("code" in data && typeof (data as { code: unknown }).code === "string") {
            code = (data as { code: string }).code;
          }
        }
      } catch {
        // body wasn't JSON
      }
      throw new ChatClientError(message, res.status, data, code);
    }

    // Idempotent duplicate path returns JSON, not a stream.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/event-stream")) {
      // Treat as a single synthetic "done" event so the hook can resolve cleanly.
      const data = await res.json().catch(() => ({}));
      const conversationId =
        data && typeof data === "object" && "conversationId" in data
          ? String((data as { conversationId: unknown }).conversationId ?? "")
          : "";
      return iterateOnce({
        event: "done",
        data: { conversationId },
      });
    }

    if (!res.body) {
      throw new ChatClientError("Response has no body", res.status, null);
    }

    return parseSseStream(res.body, signal);
  }
}

async function* iterateOnce(ev: ChatEvent): AsyncIterable<ChatEvent> {
  yield ev;
}
