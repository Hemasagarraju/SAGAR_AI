/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_INTERNAL_URL 
          ? `${process.env.BACKEND_INTERNAL_URL}/api/:path*`
          : 'http://localhost:5000/api/:path*'
      },
      {
        source: '/socket.io/:path*',
        destination: process.env.BACKEND_INTERNAL_URL 
          ? `${process.env.BACKEND_INTERNAL_URL}/socket.io/:path*`
          : 'http://localhost:5000/socket.io/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
