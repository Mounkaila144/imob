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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

};

module.exports = nextConfig;
