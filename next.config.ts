import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: 'export', // 开发时注释掉，部署时启用
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
