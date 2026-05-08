/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/vendors', destination: '/creative-network', permanent: true },
      { source: '/vendors/:slug*', destination: '/creative-network/:slug*', permanent: true },
    ];
  },
};

module.exports = nextConfig;
