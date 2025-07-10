
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This rewrites rule is a proxy. It forwards requests from the Next.js frontend
  // to your Python backend server in development. In production on Render, you would
  // configure this using environment variables.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Make sure your python server is running on localhost:5001
        destination: 'http://127.0.0.1:5001/api/:path*',
      },
    ]
  },
};

export default nextConfig;
