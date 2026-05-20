/**
 * pwa-assets.test.ts
 *
 * Adversarial gap-fill tests for Phase 6 PWA infrastructure.
 * Covers: icon files (Gap 1), Apple meta tags in index.html (Gap 2),
 * registerSW in main.tsx (Gap 3), generate-icons script in package.json (Gap 4).
 *
 * All assertions use Node.js fs / child_process — no DOM environment needed.
 */

import { describe, it, expect } from 'vitest'
import { statSync, readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const PROJECT_ROOT = path.resolve(__dirname, '../../')

// ---------------------------------------------------------------------------
// Gap 1 — UAT #2 (PWA-01): PNG icon files exist with correct dimensions and
//          non-trivial file size (>500 bytes).
// ---------------------------------------------------------------------------
describe('Gap 1 — PWA icon files (UAT #2 / PWA-01)', () => {
  const icons = [
    { file: 'icon-192.png', expectedDimensions: '192 x 192' },
    { file: 'icon-512.png', expectedDimensions: '512 x 512' },
    { file: 'icon-512-maskable.png', expectedDimensions: '512 x 512' },
    { file: 'apple-touch-icon.png', expectedDimensions: '180 x 180' },
  ]

  for (const { file, expectedDimensions } of icons) {
    const iconPath = path.join(PROJECT_ROOT, 'public', 'icons', file)

    it(`${file} exists in public/icons/`, () => {
      expect(existsSync(iconPath), `Expected ${iconPath} to exist`).toBe(true)
    })

    it(`${file} is larger than 500 bytes (non-blank PNG)`, () => {
      const size = statSync(iconPath).size
      expect(size, `Expected ${file} to be >500 bytes, got ${size}`).toBeGreaterThan(500)
    })

    it(`${file} has correct dimensions: ${expectedDimensions}`, () => {
      // Use the `file` CLI command — available on macOS/Linux.
      // Output format: "public/icons/icon-192.png: PNG image data, 192 x 192, ..."
      const output = execSync(`file "${iconPath}"`).toString()
      expect(
        output,
        `Expected \`file\` output for ${file} to report "${expectedDimensions}". Got: ${output.trim()}`
      ).toContain(expectedDimensions)
    })
  }
})

// ---------------------------------------------------------------------------
// Gap 2 — UAT #3 (PWA-01): Apple PWA meta tags in index.html.
// ---------------------------------------------------------------------------
describe('Gap 2 — Apple PWA meta tags in index.html (UAT #3 / PWA-01)', () => {
  const htmlPath = path.join(PROJECT_ROOT, 'index.html')
  let html: string

  // Read once; individual tests reference the variable.
  try {
    html = readFileSync(htmlPath, 'utf-8')
  } catch {
    html = ''
  }

  it('index.html exists and is non-empty', () => {
    expect(html.length, 'index.html must be readable and non-empty').toBeGreaterThan(0)
  })

  it('contains apple-mobile-web-app-capable with content="yes"', () => {
    expect(html).toMatch(/apple-mobile-web-app-capable/)
    expect(html).toMatch(/apple-mobile-web-app-capable[^>]+content="yes"/)
  })

  it('contains apple-mobile-web-app-status-bar-style with content="black-translucent"', () => {
    expect(html).toMatch(/apple-mobile-web-app-status-bar-style/)
    expect(html).toMatch(/apple-mobile-web-app-status-bar-style[^>]+content="black-translucent"/)
  })

  it('contains apple-mobile-web-app-title with content="Math Time"', () => {
    expect(html).toMatch(/apple-mobile-web-app-title/)
    expect(html).toMatch(/apple-mobile-web-app-title[^>]+content="Math Time"/)
  })

  it('contains <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">', () => {
    expect(html).toMatch(/rel="apple-touch-icon"/)
    expect(html).toMatch(/href="\/icons\/apple-touch-icon\.png"/)
  })

  it('contains theme-color meta tag with value #FF6B35', () => {
    expect(html).toMatch(/name="theme-color"/)
    expect(html).toMatch(/content="#FF6B35"/)
  })

  it('does NOT contain a manual <link rel="manifest"> tag (vite-plugin-pwa injects it at build time)', () => {
    // vite-plugin-pwa auto-injects <link rel="manifest"> during build.
    // A manually added one would create a duplicate and is explicitly forbidden by the plan.
    expect(html).not.toMatch(/<link[^>]+rel="manifest"/)
  })
})

// ---------------------------------------------------------------------------
// Gap 3 — UAT #4 (PWA-02): registerSW import and call in src/main.tsx.
// ---------------------------------------------------------------------------
describe('Gap 3 — registerSW in src/main.tsx (UAT #4 / PWA-02)', () => {
  const mainPath = path.join(PROJECT_ROOT, 'src', 'main.tsx')
  let mainContent: string
  let mainLines: string[]

  try {
    mainContent = readFileSync(mainPath, 'utf-8')
    mainLines = mainContent.split('\n')
  } catch {
    mainContent = ''
    mainLines = []
  }

  it('src/main.tsx exists and is non-empty', () => {
    expect(mainContent.length).toBeGreaterThan(0)
  })

  it("line 1 is `import { registerSW } from 'virtual:pwa-register'`", () => {
    // The plan requirement is exact: line 1 must be the registerSW import.
    const line1 = mainLines[0]
    expect(
      line1,
      `Expected line 1 of main.tsx to be the registerSW import. Got: "${line1}"`
    ).toBe("import { registerSW } from 'virtual:pwa-register'")
  })

  it('calls registerSW({ immediate: true }) before ReactDOM.createRoot', () => {
    // Verify the call exists at all.
    expect(mainContent).toMatch(/registerSW\(\s*\{\s*immediate\s*:\s*true\s*\}\s*\)/)

    // Verify it appears BEFORE ReactDOM.createRoot.
    const swCallIndex = mainContent.indexOf('registerSW(')
    const createRootIndex = mainContent.indexOf('ReactDOM.createRoot')
    expect(swCallIndex, 'registerSW call not found in main.tsx').toBeGreaterThan(-1)
    expect(createRootIndex, 'ReactDOM.createRoot not found in main.tsx').toBeGreaterThan(-1)
    expect(
      swCallIndex,
      'registerSW({ immediate: true }) must appear before ReactDOM.createRoot'
    ).toBeLessThan(createRootIndex)
  })
})

// ---------------------------------------------------------------------------
// Gap 4 — UAT #6 (PWA-01): generate-icons script in package.json.
// ---------------------------------------------------------------------------
describe('Gap 4 — generate-icons script in package.json (UAT #6 / PWA-01)', () => {
  const pkgPath = path.join(PROJECT_ROOT, 'package.json')
  let pkg: { scripts?: Record<string, string> }

  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  } catch {
    pkg = {}
  }

  it('package.json parses successfully and has a scripts field', () => {
    expect(pkg.scripts).toBeDefined()
  })

  it('scripts["generate-icons"] equals "pwa-assets-generator"', () => {
    expect(
      pkg.scripts?.['generate-icons'],
      `Expected scripts["generate-icons"] to be "pwa-assets-generator", got: ${JSON.stringify(pkg.scripts?.['generate-icons'])}`
    ).toBe('pwa-assets-generator')
  })
})
