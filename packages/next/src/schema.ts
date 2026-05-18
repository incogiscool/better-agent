import { z, type ZodType } from "zod";
import type { ToolSchema } from "./types";

/**
 * Convert a Zod schema to JSON Schema. Plain JSON Schema objects pass through.
 *
 * We detect Zod schemas duck-typed (via `._def`) rather than by `instanceof` so
 * the SDK and CLI tolerate different Zod module instances when bundled.
 */
export function toJsonSchema(schema: ToolSchema): Record<string, unknown> {
  if (isZodSchema(schema)) {
    return z.toJSONSchema(schema) as Record<string, unknown>;
  }
  return schema;
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
