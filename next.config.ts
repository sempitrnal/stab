import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 192.168.*.* lets phones on the local Wi-Fi load the dev server.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
