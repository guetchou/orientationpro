
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8045,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'MAKOKI — Orientation, compétences et emploi',
        short_name: 'MAKOKI',
        description: 'Comprendre ses centres d’intérêt, explorer les métiers et construire ses prochaines étapes.',
        theme_color: '#047857',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        globIgnores: ['**/image*.png', '**/images/**/*.png'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [{
          urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        }]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('lucide-react')) return 'lucide-react';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('@tanstack/react-query')) return 'react-query';
            if (id.includes('recharts')) return 'recharts';
            return 'vendor';
          }
          if (id.includes('/pages/admin/')) return 'admin-pages';
          if (id.includes('/pages/conseiller/')) return 'conseiller-pages';
          if (id.includes('/pages/recruteur/')) return 'recruteur-pages';
          if (id.includes('/pages/coach/')) return 'coach-pages';
          if (id.includes('/pages/rh/')) return 'rh-pages';
          if (id.includes('/pages/superadmin/')) return 'superadmin-pages';
          if (id.includes('/components/home/PremiumAnimations')) return 'premium-animations';
          if (id.includes('/components/home/AdvancedAnimations')) return 'advanced-animations';
          if (id.includes('/components/home/UltraUI')) return 'ultra-ui';
          if (id.includes('/components/ui/')) return 'ui-components';
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
    ],
  },
}));
