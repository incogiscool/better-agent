"use client";

import * as React from "react";
import { ChatClient } from "../client/ChatClient";
import { buildDispatcher, type Dispatcher } from "../client/dispatch";
import type {
  BetterAgentConfig,
  ChatError,
} from "../types";

type ContextValue = {
  client: ChatClient;
  dispatcher: Dispatcher;
  endUserId: string;
  onError?: (error: ChatError) => void;
};

const BetterAgentContext = React.createContext<ContextValue | null>(null);

export type BetterAgentProviderProps = BetterAgentConfig & {
  children: React.ReactNode;
};

export function BetterAgentProvider({
  clientKey,
  apiUrl,
  endUserId,
  actions,
  serverActions,
  onError,
  children,
}: BetterAgentProviderProps) {
  const client = React.useMemo(
    () => new ChatClient({ clientKey, apiUrl, endUserId }),
    [clientKey, apiUrl, endUserId],
  );

  // Re-build the dispatcher whenever actions/serverActions change so handlers
  // are always current. Dispatcher is cheap to create.
  const dispatcher = React.useMemo<Dispatcher>(
    () => buildDispatcher({ client, actions, serverActions }),
    [client, actions, serverActions],
  );

  const value = React.useMemo<ContextValue>(
    () => ({ client, dispatcher, endUserId, onError }),
    [client, dispatcher, endUserId, onError],
  );

  return (
    <BetterAgentContext.Provider value={value}>
      {children}
    </BetterAgentContext.Provider>
  );
}

export function useBetterAgentContext(): ContextValue {
  const ctx = React.useContext(BetterAgentContext);
  if (!ctx) {
    throw new Error(
      "BetterAgent: hooks must be used inside a <BetterAgentProvider>.",
    );
  }
  return ctx;
}
