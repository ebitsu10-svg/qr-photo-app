import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native modules external so Vercel doesn't try to bundle them
  serverExternalPackages: ["sharp", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1e009ba422434b0283e9f7194b407954.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
