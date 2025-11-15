import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/claude_aquatic_kelp',
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
};

export default nextConfig;
