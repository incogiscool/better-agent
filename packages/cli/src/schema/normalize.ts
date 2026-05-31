import { z } from "zod";
import type { ToolMetadata } from "betteragent-next";

const syncToolSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        "Tool name must be alphanumeric with underscores",
      ),
    type: z.enum(["route", "client_invocation"]),
    method: z.string().optional(),
    path: z.string().optional(),
    description: z.string().max(2000).optional(),
    schema: z.looseObject({}),
    aiGeneratedDescription: z.boolean().default(false),
  })
  .superRefine((tool, ctx) => {
    if (tool.type === "route") {
      if (!tool.method) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "method is required for route tools",
          path: ["method"],
        });
      }
      if (!tool.path) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "path is required for route tools",
          path: ["path"],
        });
      }
    }
  });

export type SyncTool = z.infer<typeof syncToolSchema>;

export function metadataToSyncTool(md: ToolMetadata): SyncTool {
  const raw =
    md.kind === "route"
      ? {
          name: md.name,
          type: "route" as const,
          method: md.method,
          path: md.path,
          description: md.description,
          schema: md.schema,
          aiGeneratedDescription: false,
        }
      : {
          name: md.name,
          type: "client_invocation" as const,
          description: md.description,
          schema: md.schema,
          aiGeneratedDescription: false,
        };

  const parsed = syncToolSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path?.length ? first.path.join(".") : "tool";
    throw new Error(
      `Tool \`${md.name}\`: ${where} — ${first?.message ?? "validation failed"}`,
    );
  }
  return parsed.data;
}
