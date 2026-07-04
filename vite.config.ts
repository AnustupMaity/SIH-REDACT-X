import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import electron from 'vite-plugin-electron-renderer';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    electron(),
    react(),
    viteStaticCopy({
      targets: [
        { src: 'public/*', dest: '' },
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RedactX',
        short_name: 'RedactX-2.0',
        description: 'NLP based auto redaction tool',
        theme_color: '#ffffff',
        background_color: '#61DBFB',
        display: 'standalone',
        icons: [
          {
            src: '/icon1.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon1.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: './',
  build: {
    outDir: 'dist-react',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('docx') || id.includes('jspdf') || id.includes('file-saver')) {
              return 'office-vendor';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});