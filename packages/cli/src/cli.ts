import { defineCommand, runMain } from "citty";
import pkg from "../package.json";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { whoamiCommand } from "./commands/whoami";
import { syncCommand } from "./commands/sync";
import { addCommand } from "./commands/add";
import { removeCommand } from "./commands/remove";
import { discoverCommand } from "./commands/discover";
import { initCommand } from "./commands/init";

const main = defineCommand({
  meta: {
    name: "betteragent",
    version: pkg.version,
    description: "Sync tools and install chat components for BetterAgent.",
  },
  subCommands: {
    login: loginCommand,
    logout: logoutCommand,
    whoami: whoamiCommand,
    init: initCommand,
    discover: discoverCommand,
    sync: syncCommand,
    add: addCommand,
    remove: removeCommand,
  },
});

runMain(main);
