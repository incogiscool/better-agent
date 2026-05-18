import pc from "picocolors";

function write(line: string) {
  process.stderr.write(line + "\n");
}

export const log = {
  info(message: string) {
    write(`${pc.dim("›")} ${message}`);
  },
  success(message: string) {
    write(`${pc.green("✓")} ${message}`);
  },
  warn(message: string) {
    write(`${pc.yellow("!")} ${message}`);
  },
  error(message: string) {
    write(`${pc.red("✗")} ${message}`);
  },
  step(message: string) {
    write(`${pc.cyan("→")} ${message}`);
  },
  plain(message: string) {
    write(message);
  },
  dim(message: string) {
    write(pc.dim(message));
  },
  hint(message: string) {
    write(pc.dim(`  ${message}`));
  },
};

export function fail(message: string, hint?: string): never {
  log.error(message);
  if (hint) log.hint(hint);
  process.exit(1);
}
