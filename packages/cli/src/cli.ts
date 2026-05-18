import { defineCommand, runMain } from "citty";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { whoamiCommand } from "./commands/whoami";
import { syncCommand } from "./commands/sync";

const main = defineCommand({
  meta: {
    name: "betteragent",
    version: "0.1.0",
    description: "Sync your BetterAgent tool definitions.",
  },
  subCommands: {
    login: loginCommand,
    logout: logoutCommand,
    whoami: whoamiCommand,
    sync: syncCommand,
  },
});

runMain(main);
