import { REGISTRY } from "@/lib/registry/manifest";
import { APP_URL } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "betteragent",
      homepage: APP_URL,
      items: REGISTRY.map((c) => ({
        name: c.name,
        type: c.type,
        description: c.description,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    },
  );
}
