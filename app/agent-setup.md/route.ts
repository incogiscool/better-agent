import { AGENT_PROMPT } from "@/lib/agent-prompt";

// Serve the AI setup prompt as raw markdown from the single source of truth
// (lib/agent-prompt.ts), which also drives the /docs/ai-setup page.
export const dynamic = "force-static";

export function GET() {
  return new Response(AGENT_PROMPT, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
