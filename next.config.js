import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Compiler (stable in Next.js 16)
  // Automatically optimizes component rendering and reduces need for manual memoization
  reactCompiler: true,

  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  },
  images: {
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
      }
    ]
  }
};

export default nextConfig;
