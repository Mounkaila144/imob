/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gardé les images non optimisées si nécessaire
  images: { unoptimized: true },
  turbopack: {},
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
