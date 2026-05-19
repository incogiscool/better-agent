import { z } from "zod";

// JSON Schema is an open object — we validate structure elsewhere
const jsonSchemaObject = z.looseObject({}).transform((v) => v as Record<string, unknown>);

export const syncToolSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Tool name must be alphanumeric with underscores"),
    type: z.enum(["route", "client_invocation"]),
    method: z.string().optional(),
    path: z.string().optional(),
    description: z.string().max(2000).optional(),
    schema: jsonSchemaObject,
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

export const syncRequestSchema = z.object({
  tools: z.array(syncToolSchema).max(200),
});

export type SyncTool = z.infer<typeof syncToolSchema>;
export type SyncRequest = z.infer<typeof syncRequestSchema>;

/** @deprecated projectId is now derived from the Bearer key server-side */
export const _legacySyncRequestSchema = syncRequestSchema;
