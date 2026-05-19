import { promises as fs } from "node:fs";
import { type NextRequest } from "next/server";
import { findComponent } from "@/lib/registry/manifest";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const component = findComponent(name);

  if (!component) {
    return Response.json({ error: "Component not found" }, { status: 404 });
  }

  const files = await Promise.all(
    component.files.map(async (f) => {
      const content = await fs.readFile(f.source, "utf-8").catch(() => null);
      return content == null ? null : { path: f.target, content, type: f.type };
    }),
  );

  const validFiles = files.filter(
    (f): f is NonNullable<(typeof files)[number]> => f !== null,
  );

  return Response.json(
    {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: component.name,
      type: component.type,
      description: component.description,
      dependencies: component.dependencies,
      registryDependencies: component.registryDependencies,
      files: validFiles,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
