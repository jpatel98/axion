/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable better error messages in development
    optimizeCss: false,
  },
  // Better source maps for debugging
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map'
    }
    return config
  },
  // Suppress hydration warnings during development if they're not critical
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig