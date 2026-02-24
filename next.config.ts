import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['googleapis', 'google-auth-library'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lyz5cvfr0h.ufs.sh',
      },
    ],
  },
};

export default nextConfig;
