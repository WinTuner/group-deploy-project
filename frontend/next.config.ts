import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // สร้าง .next/standalone ให้ Dockerfile ใช้ (image เล็ก รันด้วย node server.js)
  output: "standalone",
};

export default nextConfig;
