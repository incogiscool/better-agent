export function assembleSystemPrompt(args: {
  projectSystemPrompt: string | null;
  toolCount: number;
}): string {
  const base = args.projectSystemPrompt?.trim() || "You are a helpful assistant.";
  if (args.toolCount === 0) return base;
  return `${base}\n\nYou have access to ${args.toolCount} tool${args.toolCount === 1 ? "" : "s"}. Use them when they help answer the user.`;
}
