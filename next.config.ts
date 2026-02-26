import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bootflare.com',
        pathname: '**',
      },
    ],
  },
  devIndicators: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
    staleTimes: {
      dynamic: 3600,
      static: 3600,
    },
  },
};

export default nextConfig;
