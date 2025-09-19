/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supprimé output: 'export' pour permettre les routes dynamiques
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Gardé les images non optimisées si nécessaire
  images: { unoptimized: true },

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://guidacenter.com/api',
  },

  // Réécritures d'URL pour l'API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://guidacenter.com/api/:path*'
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
