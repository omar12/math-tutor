# Math Tutor — Kids Edition

An iPad-optimized math tutor for kids in grades 1–3. Kids work through animated, narrated lessons followed by practice problems. Parents can check a PIN-protected dashboard to see exactly where their child is thriving and where they need more practice — no accounts, no backend, no setup friction.

## Features

- Animated lessons with narration (addition, subtraction, word problems)
- Practice problems with immediate, encouraging feedback
- Parent dashboard behind a PIN — shows progress and problem areas
- Fully local — all data stays on the device (no server, no accounts)
- PWA-ready — installs to iPad home screen

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7 · Dexie (IndexedDB) · Howler.js · Motion

## Running Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. For the best experience, use Safari on an iPad or enable iPad emulation in browser DevTools (768×1024 portrait).

## Other Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |

## Project Structure

```
src/
  components/   Reusable UI components (widgets, mascot, progress bar)
  screens/      Top-level route screens (Home, Lesson, Practice, Parent, PIN)
  data/         Lesson content and math problem definitions
  db/           Dexie database schema and hooks
  context/      App-wide React context and state
```

## Notes

- Designed for iPad Safari (touch-first, 44px minimum touch targets)
- All progress stored in IndexedDB via Dexie — clearing browser data resets progress
- Parent PIN is stored as a hash in localStorage
