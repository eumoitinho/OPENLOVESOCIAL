#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correções de performance...\n');

// 1. Criar hook otimizado para throttle
const throttleHook = `import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        lastRun.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );
}
`;

// 2. Criar hook para verificar se componente está montado
const isMountedHook = `import { useEffect, useRef } from 'react';

export function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}
`;

// 3. Criar configuração otimizada do Next.js
const nextConfigOptimized = `import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Otimizações de imagem
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Otimizações de build
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@heroui/react',
      '@radix-ui/react-*',
      'lucide-react',
      'framer-motion'
    ],
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Tree shaking
    config.optimization.usedExports = true;
    
    // Split chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'async',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    
    return config;
  },
};

// Configuração do Sentry (se estiver usando)
const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

export default process.env.SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
`;

// 4. Criar store Zustand otimizada
const optimizedStore = `import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

// Exemplo de store otimizada
interface StoreState {
  // Estado
  user: any;
  posts: any[];
  isLoading: boolean;
  
  // Actions
  setUser: (user: any) => void;
  setPosts: (posts: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<StoreState>()(
  subscribeWithSelector((set) => ({
    // Estado inicial
    user: null,
    posts: [],
    isLoading: false,
    
    // Actions otimizadas
    setUser: (user) => set({ user }, false, 'setUser'),
    setPosts: (posts) => set({ posts }, false, 'setPosts'),
    setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
  }))
);

// Selectors otimizados
export const useUser = () => useStore((state) => state.user);
export const usePosts = () => useStore((state) => state.posts);
export const useIsLoading = () => useStore((state) => state.isLoading);

// Selector com shallow comparison para múltiplos valores
export const useUserAndPosts = () => 
  useStore(
    (state) => ({ user: state.user, posts: state.posts }),
    shallow
  );
`;

// Salvar arquivos
try {
  // Criar diretório de hooks se não existir
  const hooksDir = path.join(__dirname, '..', 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Salvar hooks otimizados
  fs.writeFileSync(path.join(hooksDir, 'use-throttle.tsx'), throttleHook);
  console.log('✅ Criado: hooks/use-throttle.tsx');

  fs.writeFileSync(path.join(hooksDir, 'use-is-mounted.tsx'), isMountedHook);
  console.log('✅ Criado: hooks/use-is-mounted.tsx');

  // Backup do next.config.mjs atual
  const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
  if (fs.existsSync(nextConfigPath)) {
    fs.copyFileSync(nextConfigPath, nextConfigPath + '.backup');
    console.log('✅ Backup criado: next.config.mjs.backup');
  }

  // Salvar nova configuração
  fs.writeFileSync(nextConfigPath, nextConfigOptimized);
  console.log('✅ Atualizado: next.config.mjs');

  // Criar exemplo de store otimizada
  const libDir = path.join(__dirname, '..', 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(libDir, 'store-optimized.ts'), optimizedStore);
  console.log('✅ Criado: lib/store-optimized.ts (exemplo)');

  console.log('\n📝 INSTRUÇÕES PARA APLICAR AS CORREÇÕES:\n');
  console.log('1. VAZAMENTOS DE MEMÓRIA:');
  console.log('   - Use o hook useThrottle ao invés de debounce manual');
  console.log('   - Use o hook useIsMounted para verificar se componente está montado');
  console.log('   - Sempre limpe intervals/timeouts no cleanup do useEffect\n');

  console.log('2. OTIMIZAÇÕES DE COMPONENTES:');
  console.log('   - Implemente React.memo() em componentes que recebem props estáveis');
  console.log('   - Use useMemo/useCallback para valores e funções computadas');
  console.log('   - Implemente lazy loading com next/dynamic\n');

  console.log('3. OTIMIZAÇÕES DE IMAGENS:');
  console.log('   - Substitua <img> por next/image');
  console.log('   - Use placeholder="blur" para imagens estáticas');
  console.log('   - Configure sizes adequados para responsividade\n');

  console.log('4. OTIMIZAÇÕES DE ESTADO:');
  console.log('   - Use selectors específicos do Zustand (veja lib/store-optimized.ts)');
  console.log('   - Evite subscrever a todo o estado quando precisar apenas de parte dele\n');

  console.log('⚠️  IMPORTANTE: Teste todas as mudanças antes de fazer deploy!');

} catch (error) {
  console.error('❌ Erro ao aplicar correções:', error);
  process.exit(1);
}