import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const THEME = '#0f172a'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Atelier carrosserie',
        short_name: 'Atelier',
        description: 'Gestion des clients, véhicules, travaux et photos',
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: THEME,
        theme_color: THEME,
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [{ name: 'Nouvelle entrée', url: '/nouveau', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192' }] }],
      },
      workbox: {
        // App shell works offline; API data is never cached so it is always fresh.
        // Only Latin font files: the other subsets are never used by a French UI.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}', '**/*latin*.woff2'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Photo URLs never change content, so they can be served from the device.
            // This cache is cleared on logout (see stores/auth.js).
            urlPattern: ({ url }) => url.pathname.startsWith('/api/photos/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'photos',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 24 * 3600 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // `npm run dev` in ../backend serves the API on 8787
    proxy: { '/api': 'http://localhost:8787' },
  },
})
