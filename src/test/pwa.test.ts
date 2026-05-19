import { describe, it, expect } from 'vitest'
import { pwaOptions } from '../../vite.config'

describe('VitePWA config', () => {
  it('Test 1 (PWA-01): vite.config.ts exports pwaOptions with registerType autoUpdate', () => {
    expect(pwaOptions).toBeDefined()
    expect(pwaOptions.registerType).toBe('autoUpdate')
  })

  it('Test 2 (PWA-01): manifest has correct name, short_name, display, theme_color, background_color, start_url, scope', () => {
    const manifest = pwaOptions.manifest
    expect(manifest).toBeDefined()
    expect(manifest!.name).toBe('Math Time!')
    expect(manifest!.short_name).toBe('Math Time')
    expect(manifest!.display).toBe('standalone')
    expect(manifest!.theme_color).toBe('#FF6B35')
    expect(manifest!.background_color).toBe('#FFF8F0')
    expect(manifest!.start_url).toBe('/')
    expect(manifest!.scope).toBe('/')
  })

  it('Test 3 (PWA-01): manifest.icons has entries for 192x192 (any), 512x512 (any), and 512x512 (maskable)', () => {
    const icons = pwaOptions.manifest!.icons as Array<{
      src: string
      sizes: string
      type: string
      purpose: string
    }>
    expect(icons).toBeDefined()

    const icon192 = icons.find((i) => i.sizes === '192x192' && i.purpose === 'any')
    expect(icon192).toBeDefined()

    const icon512any = icons.find((i) => i.sizes === '512x512' && i.purpose === 'any')
    expect(icon512any).toBeDefined()

    const icon512maskable = icons.find((i) => i.sizes === '512x512' && i.purpose === 'maskable')
    expect(icon512maskable).toBeDefined()
  })

  it('Test 4 (PWA-02): workbox.globPatterns includes audio/**/*.{mp3,ogg,wav}', () => {
    const globPatterns = pwaOptions.workbox?.globPatterns
    expect(globPatterns).toBeDefined()
    expect(globPatterns).toContain('audio/**/*.{mp3,ogg,wav}')
  })

  it('Test 5 (PWA-02): workbox.navigateFallback is index.html', () => {
    expect(pwaOptions.workbox?.navigateFallback).toBe('index.html')
  })

  it('Test 6 (PWA-02): workbox.cleanupOutdatedCaches is true', () => {
    expect(pwaOptions.workbox?.cleanupOutdatedCaches).toBe(true)
  })
})
