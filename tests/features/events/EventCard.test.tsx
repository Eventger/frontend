import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { EventCard } from '@/features/events/components/EventCard'
import type { Event } from '@/features/events/types/event.types'

describe('EventCard', () => {
  const baseEvent: Event = {
    id: 42,
    name: 'Gala Anual',
    typeId: 1,
    eventDate: '2026-11-20',
    location: 'Centro de Convenciones',
    contact: 'contacto@evento.com',
  }

  it('debe renderizar el nombre del evento, fecha formateada y enlace al detalle', () => {
    render(
      <MemoryRouter>
        <EventCard event={baseEvent} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Gala Anual')).toBeTruthy()
    expect(screen.getByText(/nov/i)).toBeTruthy()

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/evento/42')
  })

  it('debe mostrar el progreso enviado por el backend correctamente', () => {
    const eventWithProgress: Event = {
      ...baseEvent,
      progress: {
        completed: 3,
        total: 4,
        percentage: 75,
      },
    }

    render(
      <MemoryRouter>
        <EventCard event={eventWithProgress} />
      </MemoryRouter>,
    )

    expect(screen.getByText('75 % · 3/4 tareas')).toBeTruthy()
  })

  it('debe mostrar 0% y 0/0 tareas cuando el objeto progress viene vacío o no está definido', () => {
    render(
      <MemoryRouter>
        <EventCard event={baseEvent} />
      </MemoryRouter>,
    )

    expect(screen.getByText('0 % · 0/0 tareas')).toBeTruthy()
  })
})