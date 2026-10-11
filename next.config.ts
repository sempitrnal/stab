import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 192.168.*.* lets phones on the local Wi-Fi load the dev server.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*"],
  // The 3D logo's model and lighting map never change under the same name, so
  // let browsers keep them for a year (rename the file to ship a new one).
  async headers() {
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      { source: "/stab.glb", headers: immutable },
      { source: "/park.hdr", headers: immutable },
    ];
  },
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
