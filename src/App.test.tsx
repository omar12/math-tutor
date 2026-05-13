import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

describe('App routing', () => {
  it('renders HomeScreen at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Start Learning')).toBeInTheDocument()
  })

  it('renders LessonScreen at /lesson', () => {
    render(
      <MemoryRouter initialEntries={['/lesson']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Lesson')).toBeInTheDocument()
  })

  it('renders PracticeScreen at /practice', () => {
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Practice')).toBeInTheDocument()
  })

  it('renders ParentScreen at /parent', () => {
    render(
      <MemoryRouter initialEntries={['/parent']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Parent View')).toBeInTheDocument()
  })

  it('redirects unknown path to HomeScreen', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Start Learning')).toBeInTheDocument()
  })
})
