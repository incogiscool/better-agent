import { z } from "zod";

export const chatRequestSchema = z.object({
  endUserId: z.string().min(1).max(200),
  conversationId: z.string().min(1).optional(),
  message: z.object({
    content: z.string().min(1).max(50_000),
  }),
  idempotencyKey: z.string().max(200).optional(),
});

export const executeResultRequestSchema = z
  .object({
    conversationId: z.string().min(1),
    toolCallId: z.string().min(1),
    output: z.unknown().optional(),
    error: z.string().max(2000).optional(),
  })
  .refine((v) => v.output !== undefined || v.error !== undefined, {
    message: "Either output or error is required",
  });

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ExecuteResultRequest = z.infer<typeof executeResultRequestSchema>;
