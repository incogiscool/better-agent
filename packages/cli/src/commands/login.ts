import path from "node:path";
import { defineCommand } from "citty";
import prompts from "prompts";
import { log, fail } from "../logger";
import {
  DEFAULT_API_URL,
  writeCredential,
  credentialsPath,
  type Credential,
} from "../config/credentials";
import { readProjectConfig } from "../config/project";
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
    "api-url": {
      type: "string",
      description: "API URL override (or set BETTERAGENT_API_URL).",
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const { config } = await readProjectConfig(cwd);

    const apiUrl =
      (args["api-url"] as string | undefined) ??
      process.env.BETTERAGENT_API_URL ??
      config.apiUrl ??
      DEFAULT_API_URL;

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

    const client = createClient({ baseUrl: apiUrl, secretKey });

    let result: WhoamiResponse;
    try {
      result = await client.get<WhoamiResponse>("/api/v1/whoami");
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
