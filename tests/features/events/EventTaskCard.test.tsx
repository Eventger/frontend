import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { subtaskFixture } from './subtask.fixtures'

describe('EventTaskCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza los datos, el estado completado y las acciones', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const subtask = {
      ...subtaskFixture,
      state: 'completed' as const,
    }
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(subtask.targetDate))

    render(
      <EventTaskCard
        subtask={subtask}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByRole('heading', { name: subtask.name })).toBeTruthy()
    expect(
      screen.getByText(`${formattedDate} · ${subtask.estimatedHours} h`),
    ).toBeTruthy()
    expect(screen.getByText(subtask.details)).toBeTruthy()
    expect(screen.getByText('Completada')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith(subtask)
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledWith(subtask)
  })

  it('muestra Próxima para una subtarea pendiente con fecha futura', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'))

    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          state: 'pending',
          targetDate: '2026-09-25T12:00:00.000Z',
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Próxima')).toBeTruthy()
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
        onEdit={vi.fn()}
        onDelete={vi.fn()}
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
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Hoy')).toBeTruthy()
  })

  it('no renderiza una descripción cuando la subtarea no tiene detalles', () => {
    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          details: '',
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByText(subtaskFixture.details)).toBeNull()
  })
})
