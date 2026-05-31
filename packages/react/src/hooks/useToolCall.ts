"use client";

import type { ToolCallEntry } from "../types.js";

/**
 * Reserved hook for custom tool renderers (v1.5+). Today it's a passthrough
 * that returns the tool-call entry as-is, but exporting it now means
 * registry-installed tool renderers can adopt the same import path before
 * the surface grows.
 */
export function useToolCall(entry: ToolCallEntry): ToolCallEntry {
  return entry;
}
