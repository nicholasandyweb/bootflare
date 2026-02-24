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
    cpus: 1
  },
};

export default nextConfig;
