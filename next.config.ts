import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ Ignora errores ESLint durante el build
  },
};

export default nextConfig;
