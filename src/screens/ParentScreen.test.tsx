import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import ParentScreen from './ParentScreen'
import { db } from '../db/db'
import type { ISODateString } from '../db/db'

function renderParentScreen() {
  return render(
    <MemoryRouter initialEntries={['/parent']}>
      <Routes>
        <Route path="/parent" element={<ParentScreen />} />
        <Route path="/" element={<div data-testid="home-screen">Home</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ParentScreen', () => {
  beforeEach(async () => {
    await db.topicProgress.clear()
  })

  describe('empty state (no sessions)', () => {
    it('renders the empty-state message when no sessions recorded', async () => {
      renderParentScreen()
      expect(await screen.findByText(/No practice sessions yet/i)).toBeInTheDocument()
    })

    it('does NOT render any progressbar when no sessions recorded', async () => {
      renderParentScreen()
      // Wait for empty state to appear
      await screen.findByText(/No practice sessions yet/i)
      expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
    })
  })

  describe('with session data', () => {
    beforeEach(async () => {
      await db.topicProgress.put({
        topic: 'addition',
        accuracy: 0.78,
        attemptCount: 3,
        lastPracticed: '2026-05-17' as ISODateString,
      })
    })

    it('renders a progressbar with aria-valuenow=78 for addition at 78% accuracy', async () => {
      renderParentScreen()
      const bar = await screen.findByRole('progressbar', { name: /addition/i })
      expect(bar).toHaveAttribute('aria-valuenow', '78')
    })

    it('all three topic labels always render regardless of DB contents', async () => {
      renderParentScreen()
      expect(await screen.findByText('Addition')).toBeInTheDocument()
      expect(screen.getByText('Subtraction')).toBeInTheDocument()
      expect(screen.getByText('Word Problems')).toBeInTheDocument()
    })

    it('missing topics (Subtraction, Word Problems) render with — indicator when only addition is in DB', async () => {
      renderParentScreen()
      // Wait for data to load
      await screen.findByText('Addition')
      // Both missing topics should show the em dash for no-data
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('all three topics always present', () => {
    it('shows all three topic labels even with zero DB records', async () => {
      renderParentScreen()
      // Wait for loading to resolve
      await act(async () => {
        await new Promise(r => setTimeout(r, 50))
      })
      expect(screen.getByText('Addition')).toBeInTheDocument()
      expect(screen.getByText('Subtraction')).toBeInTheDocument()
      expect(screen.getByText('Word Problems')).toBeInTheDocument()
    })
  })

  describe('Done button', () => {
    it('Done button navigates to /', async () => {
      renderParentScreen()
      // Seed data so we're past empty-state
      await db.topicProgress.put({
        topic: 'addition',
        accuracy: 0.5,
        attemptCount: 1,
        lastPracticed: '2026-05-17' as ISODateString,
      })
      const doneBtn = await screen.findByRole('button', { name: /done/i })
      fireEvent.click(doneBtn)
      expect(await screen.findByTestId('home-screen')).toBeInTheDocument()
    })

    it('Done button text is "Done"', async () => {
      renderParentScreen()
      await db.topicProgress.put({
        topic: 'addition',
        accuracy: 0.5,
        attemptCount: 1,
        lastPracticed: '2026-05-17' as ISODateString,
      })
      expect(await screen.findByRole('button', { name: /^Done$/i })).toBeInTheDocument()
    })
  })
})
