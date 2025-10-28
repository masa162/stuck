/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Cloudflare Pages compatibility
  },
};

module.exports = nextConfig;
