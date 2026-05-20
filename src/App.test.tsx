import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

describe('App routing', () => {
  it('renders HomeScreen at /', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(await screen.findByText('Math Time!')).toBeInTheDocument()
  })

  it('renders LessonScreen at /lesson', () => {
    render(
      <MemoryRouter initialEntries={['/lesson']}>
        <App />
      </MemoryRouter>
    )
    // LessonScreen unlock screen shows "Tap anywhere to start" (stub "Lesson" text removed in 03-03)
    expect(screen.getByText('Tap anywhere to start')).toBeInTheDocument()
  })

  it('renders PracticeScreen at /practice/:lessonId', () => {
    render(
      <MemoryRouter initialEntries={['/practice/addition-grade1-01']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/problem 1 of/i)).toBeInTheDocument()
  })

  it('renders ParentScreen at /parent', async () => {
    render(
      <MemoryRouter initialEntries={['/parent']}>
        <App />
      </MemoryRouter>
    )
    expect(await screen.findByText('Parent Dashboard')).toBeInTheDocument()
  })

  it('redirects unknown path to HomeScreen', async () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    )
    expect(await screen.findByText('Math Time!')).toBeInTheDocument()
  })
})
