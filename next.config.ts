import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    TZ: "Asia/Ho_Chi_Minh", // timezone cho Node.js runtime
  },
};

export default nextConfig;
