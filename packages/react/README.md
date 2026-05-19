# @betteragent/react

```bash
npm i @betteragent/react
```

## Quick start

```tsx
"use client";

import { BetterAgentProvider, useChatStream } from "@betteragent/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BetterAgentProvider
      clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
      endUserId={"u_92ab"}
      actions={{
        openSettings: ({ tab }) => location.assign(`/settings${tab ? `?tab=${tab}` : ""}`),
      }}
    >
      {children}
    </BetterAgentProvider>
  );
}
```

```tsx
"use client";

import { useChatStream } from "@betteragent/react";

export function Chat() {
  const { messages, send, isStreaming } = useChatStream();

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <b>{m.role}</b>: {m.role === "user" ? m.content : m.content}
        </div>
      ))}
      <button disabled={isStreaming} onClick={() => send("Hello!")}>
        Send
      </button>
    </div>
  );
}
```

## What the SDK does NOT do

It does not render chat UI. For that, run `npx betteragent add <variant>` to
install one of the registry components (`sidebar`, `chat-popup`, `command-bar`,
`inline-bar`) into your project. They're shadcn-style — copied into your
codebase, fully editable.
