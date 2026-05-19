import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync } from 'fs'
import { join } from 'path'

// Vite serves index.html (SPA fallback) for any missing file, including audio.
// Howler receives HTML instead of a 404, causing decodeAudioData to fail silently.
// This plugin intercepts audio requests before the SPA fallback and returns 404
// for files that genuinely don't exist, so Howler's onloaderror fires correctly.
const audioMissing404Plugin = {
  name: 'audio-missing-404',
  configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { statusCode: number; end: () => void }, next: () => void) => void) => void } }) {
    server.middlewares.use((req, res, next) => {
      if (/\.(mp3|ogg|wav|webm|aac|flac)$/i.test(req.url ?? '')) {
        const filePath = join(process.cwd(), 'public', decodeURIComponent(req.url ?? ''))
        if (!existsSync(filePath)) {
          res.statusCode = 404
          res.end()
          return
        }
      }
      next()
    })
  },
}

export const pwaOptions = {
  registerType: 'autoUpdate' as const,
  includeAssets: ['favicon.svg', 'icons/*.png'],
  manifest: {
    name: 'Math Time!',
    short_name: 'Math Time',
    description: 'Fun math practice for grades 1–3',
    start_url: '/',
    scope: '/',
    display: 'standalone' as const,
    theme_color: '#FF6B35',
    background_color: '#FFF8F0',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: [
      '**/*.{js,css,html,ico,svg,webmanifest}',
      '**/*.{png,jpg,jpeg,gif,webp}',
      'audio/**/*.{mp3,ogg,wav}',
    ],
    navigateFallback: 'index.html',
    cleanupOutdatedCaches: true,
  },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    audioMissing404Plugin,
    VitePWA(pwaOptions),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
