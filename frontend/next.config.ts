import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:shortCode",
          destination: `${backendUrl}/:shortCode`,
        },
      ],
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;

