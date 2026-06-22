import * as React from "react";
import { JsonViewer, StatusBadge } from "@/components/dashboard/common";
import { formatDuration, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant" | "tool" | "system";

type Message = {
  id: string;
  role: Role;
  content: unknown;
  toolCalls: unknown;
  toolCallId: string | null;
  createdAt: Date;
};

type Execution = {
  id: string;
  toolName: string;
  toolCallId: string;
  messageId: string | null;
  status: string;
  input: unknown;
  output: unknown;
  durationMs: number | null;
  errorMessage: string | null;
  toolVersion: number | null;
  createdAt: Date;
};

interface ConversationTimelineProps {
  messages: Message[];
  executions: Execution[];
}

function stringifyContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content == null) return "";
  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

const ROLE_LABEL: Record<Role, string> = {
  user: "User",
  assistant: "Assistant",
  tool: "Tool",
  system: "System",
};

const ROLE_TONE: Record<Role, string> = {
  user: "border-l-foreground",
  assistant: "border-l-primary",
  tool: "border-l-sky-500",
  system: "border-l-muted-foreground",
};

export function ConversationTimeline({
  messages,
  executions,
}: ConversationTimelineProps) {
  const execsByMessageId = new Map<string, Execution[]>();
  const orphanExecs: Execution[] = [];
  for (const exec of executions) {
    if (exec.messageId) {
      const list = execsByMessageId.get(exec.messageId) ?? [];
      list.push(exec);
      execsByMessageId.set(exec.messageId, list);
    } else {
      orphanExecs.push(exec);
    }
  }

  if (messages.length === 0) {
    return (
      <p className="border border-border p-5 text-xs text-muted-foreground">
        No messages have been recorded for this conversation yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => {
        const role = msg.role as Role;
        const execs = execsByMessageId.get(msg.id) ?? [];
        const text = stringifyContent(msg.content);

        return (
          <article
            key={msg.id}
            className={cn(
              "border border-l-2 border-border bg-background",
              ROLE_TONE[role],
            )}
          >
            <header className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {ROLE_LABEL[role]}
                </span>
                {msg.toolCallId && (
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    call_{msg.toolCallId.slice(-6)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatRelativeTime(msg.createdAt)}
              </span>
            </header>
            <div className="space-y-3 px-4 py-3">
              {text && (
                <p className="whitespace-pre-wrap wrap-break-word text-xs leading-relaxed">
                  {text}
                </p>
              )}
              {role === "tool" &&
                msg.content != null &&
                typeof msg.content !== "string" && (
                  <JsonViewer value={msg.content} label="Tool result" />
                )}
              {execs.length > 0 && (
                <div className="space-y-2">
                  {execs.map((exec) => (
                    <ExecutionCard key={exec.id} exec={exec} />
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}

      {orphanExecs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Unlinked executions
          </h3>
          {orphanExecs.map((exec) => (
            <ExecutionCard key={exec.id} exec={exec} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExecutionCard({ exec }: { exec: Execution }) {
  return (
    <div className="border border-border bg-muted/20">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={exec.status} />
          <span className="font-mono text-xs">{exec.toolName}</span>
          {exec.toolVersion != null && (
            <span className="font-mono text-[10px] text-muted-foreground">
              v{exec.toolVersion}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {exec.durationMs != null && (
            <span className="font-mono">{formatDuration(exec.durationMs)}</span>
          )}
          <span>{formatRelativeTime(exec.createdAt)}</span>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <JsonViewer value={exec.input} label="Input" />
        {exec.errorMessage ? (
          <div className="border border-destructive/30 bg-destructive/5 p-3 text-[11px] text-destructive">
            {exec.errorMessage}
          </div>
        ) : (
          exec.output != null && (
            <JsonViewer
              value={exec.output}
              label="Output"
              defaultOpen={false}
            />
          )
        )}
      </div>
    </div>
  );
}
