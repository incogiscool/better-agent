import nextra from "nextra";

const withNextra = nextra({
  // Show a copy button on every code block (e.g. the AI setup prompt).
  defaultShowCopyCode: true,
});

export default withNextra({
  // This app is an isolated install (its own lockfile) living inside the
  // betteragent monorepo. Pin the tracing root here so Next doesn't pick up
  // the repo-root lockfile / main app.
  outputFileTracingRoot: import.meta.dirname,
});
