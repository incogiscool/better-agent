import { defineCommand } from "citty";
import { log, fail } from "../logger";
import { readCredential } from "../config/credentials";
import { ApiError, createClient } from "../http/client";

type WhoamiResponse = {
  ok: true;
  projectId: string;
  name: string;
  plan: string;
  clientKey: string;
};

export const whoamiCommand = defineCommand({
  meta: {
    name: "whoami",
    description: "Show the currently authenticated project.",
  },
  async run() {
    const credential = await readCredential();
    if (!credential) {
      return fail("Not signed in.", "Run `betteragent login --key <secret> --project <id>` first.");
    }

    const client = createClient({
      baseUrl: credential.apiUrl,
      secretKey: credential.secretKey,
    });

    try {
      const result = await client.get<WhoamiResponse>("/api/v1/whoami", {
        projectId: credential.projectId,
      });
      log.plain(`${result.name}`);
      log.dim(`  project:    ${result.projectId}`);
      log.dim(`  client key: ${result.clientKey}`);
      log.dim(`  plan:       ${result.plan}`);
      log.dim(`  api:        ${credential.apiUrl}`);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(
          `Stored credential is no longer valid: ${err.message}`,
          "Re-run `betteragent login`.",
        );
      }
      const message = err instanceof Error ? err.message : String(err);
      return fail(`Could not reach ${credential.apiUrl}: ${message}`);
    }
  },
});
