import path from "node:path";
import type { RouteCandidate } from "../scanner/routes";
import type { ServerActionCandidate } from "../scanner/server-actions";

/** Relative import path from cwd to filePath, always starting with ./ */
function relImport(cwd: string, filePath: string): string {
  let rel = path.relative(cwd, filePath);
  // Normalise to forward slashes
  rel = rel.split(path.sep).join("/");
  // Strip .ts/.tsx extension (importers don't include it)
  rel = rel.replace(/\.(tsx?)$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

/** camelCase from a route path: /api/v1/projects → projects */
function routeNameFromPath(routePath: string, method: string): string {
  const prefix: Record<string, string> = {
    GET: "get",
    POST: "create",
    PUT: "update",
    DELETE: "delete",
    PATCH: "update",
  };
  const p = prefix[method] ?? method.toLowerCase();
  const segments = routePath
    .replace(/^\//, "")
    .split("/")
    .filter((s) => s && !s.startsWith("[") && s !== "api")
    .map((s, i) =>
      i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1),
    );
  const noun = segments.join("") || "resource";
  return p + noun.charAt(0).toUpperCase() + noun.slice(1);
}

export function generateRoutesFile(
  cwd: string,
  selected: RouteCandidate[],
): string {
  if (selected.length === 0) {
    return [
      `import { defineRoute } from "betteragent-next";`,
      ``,
      `// No routes selected. Run betteragent discover to add some.`,
      `export const routes = [];`,
    ].join("\n");
  }

  const lines: string[] = [
    `import { z } from "zod";`,
    `import { defineRoute } from "betteragent-next";`,
    ``,
  ];

  const varNames: string[] = [];

  for (const c of selected) {
    const varName = c.suggestedName || routeNameFromPath(c.routePath, c.method);
    varNames.push(varName);

    lines.push(
      `// ${c.method} ${c.routePath}`,
      `export const ${varName} = defineRoute({`,
      `  name: "${varName}",`,
      `  method: "${c.method}",`,
      `  path: "${c.routePath}",`,
      `  description: "",`,
      `  schema: z.object({}), // TODO: add query/body parameters`,
      `});`,
      ``,
    );
  }

  lines.push(`export const routes = [${varNames.join(", ")}];`);
  return lines.join("\n");
}

export function generateServerActionsFile(
  cwd: string,
  selected: ServerActionCandidate[],
): string {
  if (selected.length === 0) {
    return [
      `"use server";`,
      ``,
      `// No server actions selected. Run betteragent discover to add some.`,
    ].join("\n");
  }

  // Separate already-wrapped from plain functions
  const wrapped = selected.filter((c) => c.alreadyWrapped);
  const plain = selected.filter((c) => !c.alreadyWrapped);

  const lines: string[] = [`"use server";`, ``];

  if (plain.length > 0) {
    lines.push(`import { z } from "zod";`);
    lines.push(`import { defineServerAction } from "betteragent-next";`);
  }

  // Imports for plain functions (group by file) — alias each to avoid
  // clashing with the export const of the same tool name below.
  const plainByFile = groupByFile(plain);
  for (const [filePath, candidates] of plainByFile) {
    const names = candidates.map((c) => `${c.exportName} as _${c.exportName}`).join(", ");
    lines.push(`import { ${names} } from "${relImport(cwd, filePath)}";`);
  }

  // Imports for already-wrapped (group by file)
  const wrappedByFile = groupByFile(wrapped);
  if (wrappedByFile.size > 0) {
    if (plain.length === 0) {
      lines.push(`import { defineServerAction } from "betteragent-next";`);
    }
    for (const [filePath, candidates] of wrappedByFile) {
      const names = candidates.map((c) => c.exportName).join(", ");
      lines.push(`import { ${names} } from "${relImport(cwd, filePath)}";`);
    }
  }

  lines.push(``);

  // Wrapped definitions for plain functions.
  // Export name matches tool name so the dispatch fallback (which keys by
  // export name when symbols are stripped across the server/client boundary)
  // can resolve tool calls correctly.
  for (const c of plain) {
    lines.push(
      `export const ${c.exportName} = defineServerAction({`,
      `  name: "${c.exportName}",`,
      `  description: "",`,
      `  schema: z.object({}), // TODO: add parameters`,
      `  handler: _${c.exportName},`,
      `});`,
      ``,
    );
  }

  // Already-wrapped are re-exported individually
  if (wrapped.length > 0) {
    const names = wrapped.map((c) => c.exportName).join(", ");
    lines.push(`export { ${names} };`, ``);
  }

  return lines.join("\n");
}

/**
 * Generate the AgentProvider wrapper component. It lives in a "use client"
 * file and does `import *` from the "use server" actions file — this is the
 * pattern that avoids all the Server→Client serialization boundary issues.
 * Generated once during `betteragent init`; never needs updating when actions change.
 */
export function generateProviderComponent(
  serverActionsFilePath: string,
  providerFilePath: string,
): string {
  const rel = path.relative(path.dirname(providerFilePath), serverActionsFilePath)
    .replace(/\.(tsx?)$/, "")
    .replace(/\\/g, "/");
  const importPath = rel.startsWith(".") ? rel : "./" + rel;

  return [
    `"use client";`,
    ``,
    `import { BetterAgentProvider } from "betteragent-react";`,
    `import type { AuthToken } from "betteragent-react";`,
    `import * as serverActions from "${importPath}";`,
    ``,
    `export function AgentProvider({`,
    `  children,`,
    `  clientKey,`,
    `  apiUrl,`,
    `  endUserId,`,
    `  authToken,`,
    `}: {`,
    `  children: React.ReactNode;`,
    `  clientKey: string;`,
    `  apiUrl?: string;`,
    `  endUserId: string;`,
    `  authToken?: AuthToken;`,
    `}) {`,
    `  return (`,
    `    <BetterAgentProvider`,
    `      clientKey={clientKey}`,
    `      apiUrl={apiUrl}`,
    `      endUserId={endUserId}`,
    `      authToken={authToken}`,
    `      serverActions={serverActions}`,
    `    >`,
    `      {children}`,
    `    </BetterAgentProvider>`,
    `  );`,
    `}`,
  ].join("\n");
}

export function generateActionsTemplate(): string {
  return [
    `import { z } from "zod";`,
    `import { defineAction } from "betteragent-next";`,
    ``,
    `// Client actions are browser-only effects (open modal, navigate, refresh UI).`,
    `// betteragent discover cannot find these automatically — declare them manually.`,
    `//`,
    `// Example:`,
    `// export const openSettings = defineAction({`,
    `//   name: "openSettings",`,
    `//   description: "Opens the settings panel.",`,
    `//   schema: z.object({ tab: z.string().optional() }),`,
    `// });`,
    ``,
    `export const actions = [`,
    `  // Add your client actions here`,
    `];`,
  ].join("\n");
}

function groupByFile(
  candidates: ServerActionCandidate[],
): Map<string, ServerActionCandidate[]> {
  const map = new Map<string, ServerActionCandidate[]>();
  for (const c of candidates) {
    const list = map.get(c.filePath) ?? [];
    list.push(c);
    map.set(c.filePath, list);
  }
  return map;
}
