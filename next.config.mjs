/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase the API route body size limit for large video uploads
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Increase to handle large video files
    },
    responseLimit: false,
  },
  // Increase the webpack buffer limit for large files
  webpack: (config) => {
    config.performance = {
      ...config.performance,
      maxAssetSize: 1024 * 1024 * 100, // 100MB
      maxEntrypointSize: 1024 * 1024 * 100, // 100MB
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
