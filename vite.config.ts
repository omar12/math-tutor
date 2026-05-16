import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    audioMissing404Plugin,
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
