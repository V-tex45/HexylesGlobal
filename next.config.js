/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['images.unsplash.com', 'hexylesglobal.com'],
      formats: ['image/avif', 'image/webp'],
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.hexylesglobal.com/:path*',
        },
      ]
    },
    experimental: {
      appDir: true,
    },
  }
  
  module.exports = nextConfig