import Link from "next/link";
import { notFound } from "next/navigation";
import { loadProjectContext } from "@/lib/dashboard/context";
import { loadConversationDetail } from "@/lib/conversations/queries";
import { Button } from "@/components/ui/button";
import {
  SectionHeader,
  StatCard,
  StatCardGrid,
  StatusBadge,
} from "@/components/dashboard/common";
import { ConversationTimeline } from "@/components/dashboard/runs/ConversationTimeline";
import {
  formatCompact,
  formatCount,
  formatCurrency,
  formatDateTime,
} from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string; conversationId: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const { id, conversationId } = await params;
  await loadProjectContext(id);

  const conversation = await loadConversationDetail(id, conversationId);
  if (!conversation) notFound();

  const runShort = `run_${conversation.id.slice(-6)}`;
  const failed = conversation.executions.some(
    (e) => e.status === "failed" || e.status === "timed_out",
  );

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        size="lg"
        className="border-0 p-0"
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{runShort}</span>
            <StatusBadge status={failed ? "failed" : conversation.status} />
          </span>
        }
        description={
          <span>
            User{" "}
            <span className="font-mono">
              u_{conversation.endUserId.slice(-6)}
            </span>{" "}
            · started {formatDateTime(conversation.createdAt)}
          </span>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/projects/${id}/runs`}>← Back to runs</Link>
          </Button>
        }
      />

      <StatCardGrid columns={4}>
        <StatCard label="Messages" value={formatCount(conversation.messages.length)} />
        <StatCard
          label="Tool calls"
          value={formatCount(conversation.executions.length)}
        />
        <StatCard
          label="Tokens"
          value={formatCompact(conversation.totals.tokens)}
          hint={conversation.totals.model ?? "—"}
        />
        <StatCard
          label="Cost"
          value={formatCurrency(conversation.totals.costUsd)}
          hint={`${formatCount(conversation.totals.credits)} credits`}
        />
      </StatCardGrid>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Timeline</h2>
        <ConversationTimeline
          messages={conversation.messages.map((m) => ({
            ...m,
            role: m.role as "user" | "assistant" | "tool" | "system",
          }))}
          executions={conversation.executions.map((e) => ({
            ...e,
            status: e.status,
          }))}
        />
      </div>
    </main>
  );
}
