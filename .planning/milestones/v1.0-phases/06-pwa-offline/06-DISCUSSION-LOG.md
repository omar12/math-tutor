# Phase 6: PWA & Offline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 6-PWA & Offline
**Areas discussed:** App icon, Audio caching, SW update behavior, Installed app identity

---

## App icon

| Option | Description | Selected |
|--------|-------------|----------|
| Derive from Remy Fox SVG | Use existing fox mascot SVG as source — convert to PNG at 192×192, 512×512, and Apple 180×180 | ✓ |
| Simple math symbol icon | Bold '+' or '∑' on a colored background — no mascot | |
| I'll provide the icon files | User supplies PNG files directly | |

**User's choice:** Derive from Remy Fox SVG

**Follow-up — icon source file:**

| Option | Description | Selected |
|--------|-------------|----------|
| Use public/favicon.svg | Standalone file, rasterize via script (sharp or Inkscape) | ✓ |
| Extract from icons.svg | May contain fox as standalone path | |
| Commit placeholder PNGs now | Flat color + letter placeholder, swap later | |

**User's choice:** Use `public/favicon.svg` as source

**Follow-up — maskable icons:**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — add padding for safe zone | ~10% padding, purpose: 'maskable any' in manifest | ✓ |
| Any purpose only | Simpler, single icon set | |

**User's choice:** Maskable with safe zone padding

**Notes:** No custom artwork provided — fox SVG is authoritative source for all icon sizes.

---

## Audio caching

| Option | Description | Selected |
|--------|-------------|----------|
| Precache all audio at install | Downloads all MP3s during SW install event | ✓ |
| Cache-on-demand (runtime caching) | Audio cached first time each lesson is played | |
| Skip audio offline | No audio cache — app degrades gracefully | |

**User's choice:** Precache all audio at install

**Follow-up — audio precache list management:**

| Option | Description | Selected |
|--------|-------------|----------|
| Glob /public/audio/** in vite-plugin-pwa config | Auto-includes new files as they're added | ✓ |
| Hardcode known audio paths | Explicit list, must update manually | |
| Cache audio at runtime instead | Network required on first play | |

**User's choice:** Glob `/public/audio/**` in vite-plugin-pwa config

**Notes:** If `/public/audio/` is empty at build time, glob produces zero entries — acceptable.

---

## SW update behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Silent auto-update | skipWaiting + clientsClaim — activates on next launch | ✓ |
| Update banner for parent | Dismissable 'Update available' UI | |
| Update on next launch only | New SW waits, no skipWaiting | |

**User's choice:** Silent auto-update

**Notes:** Appropriate for kids app — parents don't need to think about updates.

---

## Installed app identity

| Option | Description | Selected |
|--------|-------------|----------|
| "Math Tutor" | Matches HTML title | |
| "Math Time!" | Matches HomeScreen greeting | ✓ |
| "Remy's Math" or similar | Mascot-tied name | |

**User's choice:** "Math Time!"

**Follow-up — theme color:**

| Option | Description | Selected |
|--------|-------------|----------|
| Match primary color | --color-primary (#FF6B35) | ✓ |
| Match surface/background color | --color-surface (#FFF8F0) | |
| I'll pick the hex value | Custom hex | |

**User's choice:** Primary color `#FF6B35`

---

## Claude's Discretion

- vite-plugin-pwa version selection (latest stable compatible with Vite 8)
- Workbox strategy for non-audio app shell assets (CacheFirst is standard)
- Apple PWA meta tags in `index.html` (include `apple-mobile-web-app-capable`)
- Apple touch icon size (180×180 standard)

## Deferred Ideas

None — discussion stayed within phase scope.
