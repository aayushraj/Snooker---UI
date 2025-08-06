/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This is crucial for static export for Electron
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
