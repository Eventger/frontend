import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { subtaskFixture } from './subtask.fixtures'

describe('EventTaskCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza los datos, el estado completado y la nota', async () => {
    const user = userEvent.setup()
    const subtask = {
      ...subtaskFixture,
      state: 'completed' as const,
    }
    render(
      <EventTaskCard
        subtask={subtask}
      />,
    )

    expect(screen.getByRole('heading', { name: subtask.name })).toBeTruthy()
    expect(
      screen.getByText('20 oct · 2,5 h'),
    ).toBeTruthy()
    expect(screen.getByText('Completada')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Nota' }))
    expect(screen.getByText(subtask.details)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ocultar' })).toBeTruthy()

    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull()
  })

  it('muestra Pendiente para una subtarea pendiente con fecha futura', () => {
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

  it('muestra Vencida para una subtarea pendiente con fecha pasada', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'))

    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          state: 'pending',
          targetDate: '2026-09-23T12:00:00.000Z',
        }}
      />,
    )

    expect(screen.getByText('Vencida')).toBeTruthy()
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

  it.each(['2026-10-02T15:00:00Z', '2026-10-03T02:30:00Z', '2026-10-03T04:59:00Z'])('mantiene el día y la prioridad de Bogotá a las %s', (now) => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(now))
    render(<EventTaskCard subtask={{ ...subtaskFixture, targetDate: '2026-10-03T04:59:59Z' }} />)
    expect(screen.getByText('2 oct · 2,5 h')).toBeTruthy()
    expect(screen.getByText('Hoy')).toBeTruthy()
  })

  it('no renderiza el botón Nota cuando la subtarea no tiene detalles', () => {
    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          details: '',
        }}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Nota' })).toBeNull()
  })

  it('no renderiza el botón Nota cuando details solo contiene espacios', () => {
    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          details: '   ',
        }}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Nota' })).toBeNull()
  })
})
