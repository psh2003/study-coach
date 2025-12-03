/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 성능 최적화
  compress: true,
  poweredByHeader: false,

  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // 빌드 최적화
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  webpack: (config) => {
    // TensorFlow.js and MediaPipe configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
}

module.exports = nextConfig
