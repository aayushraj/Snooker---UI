/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For Electron, we need a static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
