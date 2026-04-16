import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/work-cc_baker",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: '/work-cc_baker',
  },
};

export default nextConfig;
