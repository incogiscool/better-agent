import { z } from "zod";

export const describeRequestSchema = z.object({
  projectId: z.string().min(1),
  // SHA-256 hex digest computed by the CLI
  sourceHash: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]+$/, "sourceHash must be a lowercase hex SHA-256 digest"),
  // Raw function source — capped to prevent abuse
  source: z.string().min(1).max(10_000),
});

export type DescribeRequest = z.infer<typeof describeRequestSchema>;
