import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import HomeScreen from './HomeScreen'

// Wrap with MemoryRouter since HomeScreen uses useNavigate
function renderHomeScreen() {
  return render(
    <MemoryRouter>
      <HomeScreen />
    </MemoryRouter>
  )
}

describe('HomeScreen', () => {
  it('renders the Start Learning button', () => {
    renderHomeScreen()
    expect(screen.getByText('Start Learning')).toBeInTheDocument()
  })

  it('renders the Parent button', () => {
    renderHomeScreen()
    expect(screen.getByText('Parent')).toBeInTheDocument()
  })

  it('Start Learning button meets 44px minimum touch target', () => {
    renderHomeScreen()
    const btn = screen.getByText('Start Learning')
    // min-h-[64px] class applied — larger than 44px minimum (PLAT-01)
    expect(btn).toHaveClass('min-h-[64px]')
  })

  it('renders Remy the Fox', () => {
    renderHomeScreen()
    expect(screen.getByRole('img', { name: 'Remy the Fox' })).toBeInTheDocument()
  })
})
