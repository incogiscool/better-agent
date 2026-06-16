import path from "node:path";
import nextra from "nextra";

const withNextra = nextra({
  // Show a copy button on every code block (e.g. the AI setup prompt).
  defaultShowCopyCode: true,
});

export default withNextra({
  // This app is an isolated install living inside the betteragent monorepo and
  // is deployed as its own Vercel project (Root Directory: packages/docs). Pin
  // the tracing root to the monorepo root so Next's `relativeAppDir` resolves
  // to "packages/docs" — the path Vercel's builder expects when locating the
  // `.next` output under the repo root. Pinning it to the package dir instead
  // makes `relativeAppDir` empty, so Vercel looks for `.next` at the repo root
  // and the build fails with ENOENT on `.next/package.json`.
  outputFileTracingRoot: path.join(import.meta.dirname, "..", ".."),
  experimental: {
    // Bypass Nextra's root layout for 404s to avoid LayoutRouterContext E56.
    globalNotFound: true,
  },
});
