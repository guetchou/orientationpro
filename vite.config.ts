
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
        name: 'Orientation Pro Congo',
        short_name: 'OrientationPro',
        description: 'Plateforme leader d\'orientation professionnelle au Congo',
        theme_color: '#3b82f6',
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
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [{
          urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
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
    // Optimisations pour réduire la taille du bundle
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Bibliothèques tierces majeures
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('lucide-react')) return 'lucide-react';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('@tanstack/react-query')) return 'react-query';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('recharts')) return 'recharts';
            // Autres dépendances node_modules en un chunk séparé
            return 'vendor';
          }
          
          // Séparer les pages par routes
          if (id.includes('/pages/admin/')) return 'admin-pages';
          if (id.includes('/pages/conseiller/')) return 'conseiller-pages';
          if (id.includes('/pages/recruteur/')) return 'recruteur-pages';
          if (id.includes('/pages/coach/')) return 'coach-pages';
          if (id.includes('/pages/rh/')) return 'rh-pages';
          if (id.includes('/pages/superadmin/')) return 'superadmin-pages';
          
          // Composants d'animation lourds
          if (id.includes('/components/home/PremiumAnimations')) return 'premium-animations';
          if (id.includes('/components/home/AdvancedAnimations')) return 'advanced-animations';
          if (id.includes('/components/home/UltraUI')) return 'ultra-ui';
          
          // Composants UI de base
          if (id.includes('/components/ui/')) return 'ui-components';
        },
      },
    },
    // Optimisations de performance
    target: 'esnext',
    minify: 'esbuild', // Utiliser esbuild au lieu de terser
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 500,
    // Améliorer le tree-shaking
    sourcemap: false,
  },
  // Optimisations de développement
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
