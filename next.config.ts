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
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/newsletter/:path*',
        destination: '/linkedin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
