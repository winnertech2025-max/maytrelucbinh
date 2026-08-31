import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "www.xuongghemay.com",
      },
      {
        protocol: "http",
        hostname: "maytrelucbinh.com",
      },
      {
        protocol: "http",
        hostname: "www.maytrelucbinh.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
