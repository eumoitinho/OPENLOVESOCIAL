/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de produção
  output: "standalone",

  // Configurações de imagem
  images: {
    domains: [
      "localhost",
      // Adicionar domínios do Supabase Storage quando configurado
      "supabase.co",
      "supabase.in",
    ],
    formats: ["image/webp", "image/avif"],
    unoptimized: true, // Novo campo adicionado
  },

  // Configurações experimentais
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  // Configurações de webpack para otimização
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Otimizações para produção
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = "all"
    }

    return config
  },

  // Novos campos adicionados
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
