/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supprimé output: 'export' pour permettre les routes dynamiques
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Gardé les images non optimisées si nécessaire
  images: { unoptimized: true },
};

module.exports = nextConfig;
