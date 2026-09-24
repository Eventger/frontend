import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

vi.mock('@/features/events/services/event.service', () => ({
  createEvent: vi.fn(),
  getEvents: vi.fn(),
  getEventTypes: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventTypes', () => ({
  useEventTypes: () => ({
    eventTypes: [],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/features/events/hooks/useEvents', () => ({
  useEvents: () => ({
    events: [],
    isLoading: false,
    error: null,
    retry: vi.fn(),
  }),
}))

test('redirige la raíz a la lista de eventos', async () => {
  window.history.pushState({}, '', '/')
  const { default: App } = await import('../src/app/App.tsx')

  render(<App />)

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Eventos' }),
  ).toBeTruthy()
  expect(
    screen.getByRole('heading', { level: 2, name: 'Aún no tienes eventos' }),
  ).toBeTruthy()
  expect(window.location.pathname).toBe('/eventos')
})
