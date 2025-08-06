/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // For Electron build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // For Electron build
  },
};

export default nextConfig;
