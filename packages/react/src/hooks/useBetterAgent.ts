"use client";

import { useBetterAgentContext } from "../provider/BetterAgentProvider";

export type UseBetterAgentReturn = {
  endUserId: string;
  /**
   * Whether the dispatcher has a handler registered for the given tool name.
   * Useful for UI hints ("this tool will run in your browser").
   */
  hasAction(toolName: string): boolean;
};

export function useBetterAgent(): UseBetterAgentReturn {
  const ctx = useBetterAgentContext();
  return {
    endUserId: ctx.endUserId,
    hasAction: (toolName: string) => ctx.dispatcher.resolve(toolName) != null,
  };
}
