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
      `import { defineRoute } from "@betteragent/next";`,
      ``,
      `// No routes selected. Run betteragent discover to add some.`,
      `export const routes = [];`,
    ].join("\n");
  }

  const lines: string[] = [
    `import { z } from "zod";`,
    `import { defineRoute } from "@betteragent/next";`,
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
      `import { defineServerAction } from "@betteragent/next";`,
      ``,
      `// No server actions selected. Run betteragent discover to add some.`,
      `export const serverActions = [];`,
    ].join("\n");
  }

  // Separate already-wrapped from plain functions
  const wrapped = selected.filter((c) => c.alreadyWrapped);
  const plain = selected.filter((c) => !c.alreadyWrapped);

  const lines: string[] = [];
  const finalVarNames: string[] = [];

  if (plain.length > 0) {
    lines.push(`import { z } from "zod";`);
    lines.push(`import { defineServerAction } from "@betteragent/next";`);
  }

  // Imports for plain functions (group by file)
  const plainByFile = groupByFile(plain);
  for (const [filePath, candidates] of plainByFile) {
    const names = candidates.map((c) => c.exportName).join(", ");
    lines.push(`import { ${names} } from "${relImport(cwd, filePath)}";`);
  }

  // Imports for already-wrapped (group by file)
  const wrappedByFile = groupByFile(wrapped);
  if (wrappedByFile.size > 0) {
    if (lines.length > 0) lines.push(`import { defineServerAction } from "@betteragent/next";`);
    // Remove duplicate import if already added
    const dedupedLines = lines.filter(
      (l, i, arr) => l !== `import { defineServerAction } from "@betteragent/next";` || arr.indexOf(l) === i,
    );
    lines.length = 0;
    lines.push(...dedupedLines);

    for (const [filePath, candidates] of wrappedByFile) {
      const names = candidates.map((c) => c.exportName).join(", ");
      lines.push(`import { ${names} } from "${relImport(cwd, filePath)}";`);
    }
  }

  lines.push(``);

  // Wrapped definitions for plain functions
  for (const c of plain) {
    const varName = c.exportName + "Action";
    finalVarNames.push(varName);
    lines.push(
      `export const ${varName} = defineServerAction({`,
      `  name: "${c.exportName}",`,
      `  description: "",`,
      `  schema: z.object({}), // TODO: add parameters`,
      `  handler: ${c.exportName},`,
      `});`,
      ``,
    );
  }

  // Already-wrapped are imported directly
  for (const c of wrapped) {
    finalVarNames.push(c.exportName);
  }

  lines.push(`export const serverActions = [${finalVarNames.join(", ")}];`);
  return lines.join("\n");
}

export function generateActionsTemplate(): string {
  return [
    `import { z } from "zod";`,
    `import { defineAction } from "@betteragent/next";`,
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
