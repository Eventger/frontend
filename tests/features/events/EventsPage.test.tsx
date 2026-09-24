import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEvents } from '@/features/events/hooks/useEvents'
import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import { EventsPage } from '@/features/events/pages/EventsPage'
import type { Event } from '@/features/events/types/event.types'

vi.mock('@/features/events/hooks/useEvents', () => ({
  useEvents: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventSubtasks', () => ({
  useEventSubtasks: vi.fn(),
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
  contact: 'Laura 3001234567',
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
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })
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

  it('muestra los eventos con su progreso y acceso al detalle', () => {
    vi.mocked(useEvents).mockReturnValue({
      events: [event],
      isLoading: false,
      error: null,
      retry: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('heading', { name: event.name })).toBeTruthy()
    expect(
      screen.getByText('0 % · 0/0 tareas'),
    ).toBeTruthy()
    const eventLink = screen.getByRole('link', {
      name: new RegExp(event.name),
    })
    expect(eventLink.getAttribute('href')).toBe(`/evento/${event.id}`)
  })
})
