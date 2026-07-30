import { z, type ZodType } from "zod";
import type { ToolSchema } from "./types";

/**
 * Zod throws by default on types with no JSON Schema equivalent (`Date`,
 * `BigInt`, `Symbol`, `undefined`, `void`). Since `define*` converts at module
 * scope, a single such field anywhere in a schema graph would abort the whole
 * module's import and take every other tool in the file with it. Degrade those
 * to `{}` instead, and give the two common cases a shape the agent can act on.
 */
const jsonSchemaOptions = {
  unrepresentable: "any",
  override: ({
    zodSchema,
    jsonSchema,
  }: {
    zodSchema: unknown;
    jsonSchema: Record<string, unknown>;
  }) => {
    const type = (zodSchema as { _zod?: { def?: { type?: string } } })?._zod?.def
      ?.type;
    if (type === "date") {
      jsonSchema.type = "string";
      jsonSchema.format = "date-time";
    } else if (type === "bigint") {
      // Out of range for JSON numbers — send it as a decimal string.
      jsonSchema.type = "string";
      jsonSchema.pattern = "^-?\\d+$";
    }
  },
} as const;

/**
 * Convert a Zod schema to JSON Schema. Plain JSON Schema objects pass through.
 *
 * We detect Zod schemas duck-typed (via `._def`) rather than by `instanceof` so
 * the SDK and CLI tolerate different Zod module instances when bundled.
 */
export function toJsonSchema(
  schema: ToolSchema,
  toolName?: string,
): Record<string, unknown> {
  if (!isZodSchema(schema)) return schema;
  try {
    return z.toJSONSchema(
      schema,
      jsonSchemaOptions as unknown as Parameters<typeof z.toJSONSchema>[1],
    ) as Record<string, unknown>;
  } catch (err) {
    // Never let an unconvertible schema break discovery for the rest of the
    // file. The tool still syncs, with a permissive schema and a loud warning.
    const label = toolName ? `"${toolName}"` : "a tool";
    console.warn(
      `[betteragent] Could not convert the schema for ${label} to JSON Schema ` +
        `(${err instanceof Error ? err.message : String(err)}). Falling back to ` +
        `an unconstrained object — the agent will not be told what fields to send.`,
    );
    return { type: "object", additionalProperties: true };
  }
}

export function isZodSchema(value: unknown): value is ZodType {
  if (value == null || typeof value !== "object") return false;
  // Zod schemas all carry a `_def` (and v4 also exposes `_zod`).
  return "_def" in value || "_zod" in value;
}

/**
 * Validate input against the schema when it's a Zod schema. Plain JSON Schema
 * objects are not validated at runtime (the chat engine validates against the
 * synced JSON Schema on its side).
 */
export function safeValidateInput<T>(
  schema: ToolSchema<T>,
  input: unknown,
): { ok: true; value: T } | { ok: false; message: string } {
  if (isZodSchema(schema)) {
    const result = (schema as ZodType<T>).safeParse(input);
    if (result.success) return { ok: true, value: result.data };
    const first = result.error.issues[0];
    const path = first?.path?.length ? first.path.join(".") : "input";
    return {
      ok: false,
      message: `Invalid ${path}: ${first?.message ?? "validation failed"}`,
    };
  }
  return { ok: true, value: input as T };
}
