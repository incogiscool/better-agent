export type SseEvent =
  | { event: "text_delta"; data: { delta: string } }
  | { event: "tool_call"; data: { toolCallId: string; toolName: string; input: unknown } }
  | { event: "tool_result"; data: { toolCallId: string; toolName: string; output: unknown } }
  | { event: "action_call"; data: { toolCallId: string; toolName: string; input: unknown } }
  | { event: "done"; data: { conversationId: string } }
  | { event: "error"; data: { message: string; code?: string } };

export const SSE_HEADERS: Record<string, string> = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
  "x-accel-buffering": "no",
};

const encoder = new TextEncoder();

export function encodeSse(ev: SseEvent): Uint8Array {
  const payload = `event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\n\n`;
  return encoder.encode(payload);
}

export type SseController = {
  stream: ReadableStream<Uint8Array>;
  send: (ev: SseEvent) => void;
  close: () => void;
  abort: (err: unknown) => void;
};

export function makeSseController(): SseController {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      closed = true;
    },
  });

  return {
    stream,
    send(ev) {
      if (closed) return;
      try {
        controller.enqueue(encodeSse(ev));
      } catch {
        closed = true;
      }
    },
    close() {
      if (closed) return;
      closed = true;
      try {
        controller.close();
      } catch {
        // already closed
      }
    },
    abort(err) {
      if (closed) return;
      closed = true;
      try {
        controller.error(err);
      } catch {
        // already errored
      }
    },
  };
}
