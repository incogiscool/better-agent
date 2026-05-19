import { defineCommand, runMain } from "citty";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { whoamiCommand } from "./commands/whoami";
import { syncCommand } from "./commands/sync";
import { addCommand } from "./commands/add";
import { discoverCommand } from "./commands/discover";

const main = defineCommand({
  meta: {
    name: "betteragent",
    version: "0.1.0",
    description: "Sync tools and install chat components for BetterAgent.",
  },
  subCommands: {
    login: loginCommand,
    logout: logoutCommand,
    whoami: whoamiCommand,
    discover: discoverCommand,
    sync: syncCommand,
    add: addCommand,
  },
});

runMain(main);
