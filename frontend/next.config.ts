import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'http://172.18.94.197:3000',
    '*.ngrok-free.app'
  ],
};

export default nextConfig;
