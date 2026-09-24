import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEvents } from '@/features/events/hooks/useEvents'
import { EventsPage } from '@/features/events/pages/EventsPage'
import type { Event } from '@/features/events/types/event.types'

vi.mock('@/features/events/hooks/useEvents', () => ({
  useEvents: vi.fn(),
}))

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}))

const event: Event = {
  id: 21,
  name: 'Boda Backend',
  typeId: 0,
  eventDate: '2099-12-31T00:00:00.000Z',
  location: 'Cali',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <EventsPage />
    </MemoryRouter>,
  )
}

describe('EventsPage', () => {
  beforeEach(() => {
    vi.mocked(useEvents).mockReset()
  })

  it('muestra el estado de carga', () => {
    vi.mocked(useEvents).mockReturnValue({
      events: [],
      isLoading: true,
      error: null,
      retry: vi.fn(),
    })

    renderPage()

    expect(screen.getByLabelText('Cargando eventos')).toBeTruthy()
  })

  it('muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    vi.mocked(useEvents).mockReturnValue({
      events: [],
      isLoading: false,
      error: 'No pudimos cargar los eventos',
      retry,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'No pudimos cargar tus eventos' }),
    ).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('muestra el estado vacío', () => {
    vi.mocked(useEvents).mockReturnValue({
      events: [],
      isLoading: false,
      error: null,
      retry: vi.fn(),
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Aún no tienes eventos' }),
    ).toBeTruthy()
  })

  it('muestra únicamente información real de los eventos', () => {
    vi.mocked(useEvents).mockReturnValue({
      events: [event],
      isLoading: false,
      error: null,
      retry: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('heading', { name: event.name })).toBeTruthy()
    expect(screen.getByText(event.location)).toBeTruthy()
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(
      screen.queryByRole('link', { name: /Ver evento/i }),
    ).toBeNull()
  })
})
