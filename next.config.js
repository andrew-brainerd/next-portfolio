const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  }
};

module.exports = nextConfig;
