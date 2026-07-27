import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Without these, a new service worker sits "waiting" until every open tab
        // of the old version closes, so users kept seeing stale app code after a
        // deploy (this repeatedly showed up as "the fix isn't there") until they
        // manually hard-refreshed. This makes new deploys take effect immediately.
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Qrlin Safety',
        short_name: 'Qrlin Safety',
        description: 'One QR tag for anything you want to protect',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    allowedHosts: ['qrsafety.loca.lt'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true
      }
    }
  }
});