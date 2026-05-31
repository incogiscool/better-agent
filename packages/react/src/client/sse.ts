import type { ChatEvent } from "../types.js";

/**
 * Parses a server-sent-event ReadableStream into typed `ChatEvent`s.
 *
 * The chat backend emits frames in the shape:
 *   event: <name>\n
 *   data: <JSON>\n
 *   \n
 *
 * We only parse the two fields we care about. Other SSE features (id, retry,
 * multi-line data) are out of scope for our protocol.
 */
export async function* parseSseStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncIterable<ChatEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel().catch(() => {});
        return;
      }

      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line (\n\n).
      let frameEnd: number;
      while ((frameEnd = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, frameEnd);
        buffer = buffer.slice(frameEnd + 2);
        const parsed = parseFrame(frame);
        if (parsed) yield parsed;
      }
    }

    // Flush any trailing frame (no terminating blank line — rare).
    const trailing = buffer.trim();
    if (trailing) {
      const parsed = parseFrame(trailing);
      if (parsed) yield parsed;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

function parseFrame(frame: string): ChatEvent | null {
  let event: string | null = null;
  let dataLine: string | null = null;

  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      // Server only emits single-line data — no need to concatenate.
      dataLine = line.slice(5).trim();
    }
  }

  if (!event || dataLine == null) return null;

  let data: unknown;
  try {
    data = JSON.parse(dataLine);
  } catch {
    return null;
  }

  // The shape mirrors the server's union; we trust it structurally.
  return { event, data } as ChatEvent;
}
