import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ["storage.ko-fi.com"],
  },
};

export default nextConfig;
