/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image-1308733829.cos.ap-shanghai.myqcloud.com',
      },
    ],
  },
  // Transpile these packages so webpack processes them correctly
  transpilePackages: [
    'onnxruntime-web',
    '@imgly/background-removal',
  ],
}

module.exports = nextConfig
