import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventCard } from '@/features/events/components/EventCard'
import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import type { Event } from '@/features/events/types/event.types'
import { subtaskFixture } from './subtask.fixtures'

vi.mock('@/features/events/hooks/useEventSubtasks', () => ({
  useEventSubtasks: vi.fn(),
}))

const baseEvent: Event = {
  id: 42,
  name: 'Gala Anual',
  typeId: 1,
  eventDate: '2026-11-20T18:00:00.000Z',
  location: 'Auditorio Central',
  contact: 'Carlos 3100000000',
}

describe('EventCard', () => {
  beforeEach(() => {
    vi.mocked(useEventSubtasks).mockReset()
  })

  it('usa el progreso del servidor directamente y no consulta subtareas por hook', () => {
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })

    const eventWithProgress: Event = {
      ...baseEvent,
      progress: {
        percentage: 75,
        completed: 3,
        total: 4,
      },
    }

    render(
      <MemoryRouter>
        <EventCard event={eventWithProgress} />
      </MemoryRouter>,
    )

    expect(useEventSubtasks).toHaveBeenCalledWith(null)
    expect(screen.getByText('Gala Anual')).toBeTruthy()
    expect(screen.getByText('75 % · 3/4 tareas')).toBeTruthy()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/evento/42')
  })

  it('muestra 0 % cuando el progreso del servidor indica 0 tareas', () => {
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })

    const eventWithZeroTasks: Event = {
      ...baseEvent,
      progress: {
        percentage: 0,
        completed: 0,
        total: 0,
      },
    }

    render(
      <MemoryRouter>
        <EventCard event={eventWithZeroTasks} />
      </MemoryRouter>,
    )

    expect(screen.getByText('0 % · 0/0 tareas')).toBeTruthy()
  })

  it('recurre a useEventSubtasks cuando event.progress es indefinido y calcula el porcentaje', () => {
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [
        {
          ...subtaskFixture,
          id: 1,
          eventId: 42,
          state: 'completed',
        },
        {
          ...subtaskFixture,
          id: 2,
          eventId: 42,
          state: 'pending',
        },
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter>
        <EventCard event={baseEvent} />
      </MemoryRouter>,
    )

    expect(useEventSubtasks).toHaveBeenCalledWith(42)
    expect(screen.getByText('50 % · 1/2 tareas')).toBeTruthy()
  })

  it('muestra estado de carga cuando no hay progreso del servidor y las subtareas cargan', () => {
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter>
        <EventCard event={baseEvent} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Cargando progreso…')).toBeTruthy()
  })

  it('muestra error de progreso cuando useEventSubtasks falla sin progreso del servidor', () => {
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: 'Error de red',
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter>
        <EventCard event={baseEvent} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Progreso no disponible')).toBeTruthy()
  })

  it('calcula 0 % si no hay progreso del servidor y la lista de subtareas está vacía', () => {
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter>
        <EventCard event={baseEvent} />
      </MemoryRouter>,
    )

    expect(screen.getByText('0 % · 0/0 tareas')).toBeTruthy()
  })
})
