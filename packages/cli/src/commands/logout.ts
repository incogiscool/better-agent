import { defineCommand } from "citty";
import { log } from "../logger";
import { clearCredential, credentialsPath } from "../config/credentials";

export const logoutCommand = defineCommand({
  meta: {
    name: "logout",
    description: "Remove stored credentials.",
  },
  async run() {
    const removed = await clearCredential();
    if (removed) {
      log.success(`Removed credentials at ${credentialsPath()}`);
    } else {
      log.info("Already signed out.");
    }
  },
});
