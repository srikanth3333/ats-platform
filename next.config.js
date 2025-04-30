/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  serverActions: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
