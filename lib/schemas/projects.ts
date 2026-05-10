import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(100),
  baseUrl: z.url("Base URL must be a valid URL.").optional().or(z.literal("")),
  systemPrompt: z.string().trim().max(5000).optional().or(z.literal("")),
});
