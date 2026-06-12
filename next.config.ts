import type { NextConfig } from "next";

const DOCS_URL = "https://docs.betteragent.dev";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/registry/components/**": ["./components/chat/**/*"],
  },
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      // Docs moved to the standalone docs app at docs.betteragent.dev.
      // Old on-domain paths redirect to their new (prefix-less) home.
      { source: "/docs/agent", destination: `${DOCS_URL}/ai-setup`, permanent: true },
      { source: "/docs", destination: DOCS_URL, permanent: true },
      { source: "/docs/:path*", destination: `${DOCS_URL}/:path*`, permanent: true },
      { source: "/cli", destination: `${DOCS_URL}/cli`, permanent: true },
      { source: "/components", destination: `${DOCS_URL}/components`, permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
