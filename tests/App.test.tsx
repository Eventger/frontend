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

test('muestra la pantalla de creación en la ruta correspondiente', async () => {
  window.history.pushState({}, '', '/crear')
  const { default: App } = await import('../src/app/App.tsx')

  render(<App />)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Crear evento' }),
  ).toBeTruthy()
  expect(
    screen.getByRole('heading', { level: 2, name: 'Datos del evento' }),
  ).toBeTruthy()
})
