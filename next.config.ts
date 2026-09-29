import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Todas as imagens são locais (public/media). Nenhum host remoto é permitido.
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
  typedRoutes: true,
};

export default nextConfig;
