import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
// Provide fake IndexedDB for Dexie tests in jsdom
import 'fake-indexeddb/auto'

// Howler mock — jsdom has no Web Audio API; mock Howl for unit tests
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(({ onend, onloaderror, onplayerror }: {
    onend?: () => void
    onloaderror?: () => void
    onplayerror?: () => void
  }) => ({
    play: vi.fn(),
    stop: vi.fn(),
    unload: vi.fn(),
    _callbacks: { onend, onloaderror, onplayerror },
  })),
}))
