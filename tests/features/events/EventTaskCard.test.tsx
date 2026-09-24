import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { subtaskFixture } from './subtask.fixtures'

describe('EventTaskCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza nombre, fecha, horas, detalles y estado completado', () => {
    const subtask = {
      ...subtaskFixture,
      state: 'completed' as const,
    }
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(subtask.targetDate))

    render(<EventTaskCard subtask={subtask} />)

    expect(screen.getByRole('heading', { name: subtask.name })).toBeTruthy()
    expect(
      screen.getByText(`${formattedDate} · ${subtask.estimatedHours} h`),
    ).toBeTruthy()
    expect(screen.getByText(subtask.details)).toBeTruthy()
    expect(screen.getByText('Completada')).toBeTruthy()
  })

  it('muestra Pendiente para una subtarea pendiente de otro día', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'))

    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          state: 'pending',
          targetDate: '2026-09-25T12:00:00.000Z',
        }}
      />,
    )

    expect(screen.getByText('Pendiente')).toBeTruthy()
  })

  it('deriva Hoy sin añadirlo al estado de API', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'))

    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          state: 'pending',
          targetDate: '2026-09-24T12:00:00.000Z',
        }}
      />,
    )

    expect(screen.getByText('Hoy')).toBeTruthy()
  })
})
