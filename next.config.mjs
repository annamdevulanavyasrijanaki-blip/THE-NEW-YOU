/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }
    ],
  },
  env: {
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;