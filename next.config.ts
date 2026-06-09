import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/registry/components/(.*)": ["./components/chat/**/*"],
  },
};

export default nextConfig;
