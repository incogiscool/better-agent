import { defineCommand } from "citty";
import prompts from "prompts";
import { log, fail } from "../logger";
import {
  DEFAULT_API_URL,
  writeCredential,
  credentialsPath,
  type Credential,
} from "../config/credentials";
import { ApiError, createClient } from "../http/client";

type WhoamiResponse = {
  ok: true;
  projectId: string;
  name: string;
  plan: string;
};

export const loginCommand = defineCommand({
  meta: {
    name: "login",
    description: "Authenticate the CLI with a project secret key.",
  },
  args: {
    key: {
      type: "string",
      description: "Secret key (ba_secret_...). Prompted for if omitted.",
    },
    project: {
      type: "string",
      description:
        "Project ID. Find it in your dashboard URL: /dashboard/projects/<id>.",
    },
    "api-url": {
      type: "string",
      description: "API URL override (or set BETTERAGENT_API_URL).",
    },
  },
  async run({ args }) {
    const apiUrl =
      args["api-url"] ?? process.env.BETTERAGENT_API_URL ?? DEFAULT_API_URL;

    let secretKey = args.key as string | undefined;
    if (!secretKey) {
      const response = await prompts({
        type: "password",
        name: "key",
        message: "Paste your secret key",
        validate: (v) =>
          typeof v === "string" && v.length > 10
            ? true
            : "Please paste a valid secret key",
      });
      secretKey = response.key as string | undefined;
      if (!secretKey) fail("No secret key provided.");
    }

    let projectId = args.project as string | undefined;
    if (!projectId) {
      const response = await prompts({
        type: "text",
        name: "projectId",
        message: "Project ID",
        validate: (v) =>
          typeof v === "string" && v.length > 0 ? true : "Required",
      });
      projectId = response.projectId as string | undefined;
      if (!projectId) fail("No project ID provided.");
    }

    const client = createClient({ baseUrl: apiUrl, secretKey });

    let result: WhoamiResponse;
    try {
      result = await client.get<WhoamiResponse>("/api/v1/whoami", {
        projectId,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(`Verification failed: ${err.message}`);
      }
      const message = err instanceof Error ? err.message : String(err);
      return fail(`Could not reach ${apiUrl}: ${message}`);
    }

    const credential: Credential = {
      apiUrl,
      secretKey,
      projectId: result.projectId,
      projectName: result.name,
    };
    await writeCredential(credential);

    log.success(`Signed in to ${result.name} (${result.plan}).`);
    log.hint(`Credentials saved to ${credentialsPath()}`);
  },
});
