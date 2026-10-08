/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Compiler (stable in Next.js 16)
  // Automatically optimizes component rendering and reduces need for manual memoization
  reactCompiler: true,

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(www\\.)?brainerd\\.wedding' }],
        destination: 'https://brainerd.dev/wedding',
        permanent: true
      }
    ];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.steampowered.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.freebiesupply.com'
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com'
      },
      {
        protocol: 'https',
        hostname: 'brainerd.s3.us-east-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'photos.zillowstatic.com'
      },
      {
        protocol: 'https',
        hostname: 'media.forgecdn.net'
      }
    ]
  }
};

export default nextConfig;
