/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.squarespace-cdn.com'],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml'
      },
    ]
  },
}

export default nextConfig;
