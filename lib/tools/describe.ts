import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { prisma } from "@/lib/db";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You generate concise tool descriptions for AI agents. " +
  "When given a function's source code, respond with exactly one sentence describing " +
  "what the function does — focused on what an AI agent needs to know to call it correctly. " +
  "No preamble, no punctuation at the end other than a period, no markdown.";

export async function getOrGenerateDescription(
  sourceHash: string,
  source: string,
): Promise<{ description: string; cached: boolean }> {
  const cached = await prisma.descriptionCache.findUnique({
    where: { sourceHash },
    select: { description: true },
  });

  if (cached) {
    return { description: cached.description, cached: true };
  }

  const { text } = await generateText({
    model: anthropic(MODEL),
    system: SYSTEM_PROMPT,
    prompt: `Function source:\n\n${source}`,
    maxOutputTokens: 200,
    temperature: 0.2,
  });

  const description = text.trim();

  await prisma.descriptionCache.create({
    data: { sourceHash, description, model: MODEL },
  });

  return { description, cached: false };
}
