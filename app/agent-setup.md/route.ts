import { AGENT_PROMPT } from "@/lib/agent-prompt";

// Serve the AI setup prompt as raw markdown. The prompt block embedded in
// packages/docs/content/ai-setup.mdx is a hand-maintained copy of this
// string, not generated from it — keep both in sync when editing either.
export const dynamic = "force-static";

export function GET() {
  return new Response(AGENT_PROMPT, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
