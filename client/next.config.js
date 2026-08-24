/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    '*.trycloudflare.com',
    '*.localtunnel.me',
    'localtunnel.me',
    'localhost',
    '127.0.0.1',
    '10.166.139.128'
  ],
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
