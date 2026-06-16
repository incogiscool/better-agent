import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const MODEL_ID = "claude-sonnet-4-6";

export type ValidateKeyResult = { ok: true } | { ok: false; error: string };

/**
 * Validate a customer-supplied Anthropic API key with a cheap 1-token request
 * before we persist it. Distinguishes "bad key" (auth) from transient failures
 * so the UI can show a useful message.
 */
export async function validateAnthropicKey(
  apiKey: string,
): Promise<ValidateKeyResult> {
  try {
    const anthropic = createAnthropic({ apiKey });
    await generateText({
      model: anthropic(MODEL_ID),
      prompt: "ok",
      maxOutputTokens: 1,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/401|403|authentication|invalid|unauthor/i.test(message)) {
      return {
        ok: false,
        error: "Anthropic rejected this key. Check that it's valid and active.",
      };
    }
    return {
      ok: false,
      error: `Couldn't verify the key right now: ${message}`,
    };
  }
}
