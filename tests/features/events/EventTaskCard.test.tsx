import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { subtaskFixture } from './subtask.fixtures'

describe('EventTaskCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza los datos, el estado completado y los detalles', async () => {
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
    expect(screen.getByText(/20 oct/)).toBeTruthy()
    expect(screen.getByText(/2,5 h/)).toBeTruthy()
    expect(screen.getByText('Completada')).toBeTruthy()
    expect(screen.getByText('Vencida')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: subtask.name }))
    expect(screen.getByText(subtask.details)).toBeTruthy()

    expect(screen.queryByRole('button', { name: 'Nota' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull()
  })

  it('permite ver y ocultar la nota desde el menú de acciones', async () => {
    const user = userEvent.setup()
    render(<EventTaskCard subtask={subtaskFixture} />)

    const actionsButton = screen.getByRole('button', { name: `Más acciones para ${subtaskFixture.name}` })
    await user.click(actionsButton)
    await user.click(screen.getByRole('menuitem', { name: `Ver detalle de ${subtaskFixture.name}` }))

    expect(screen.getByText('Detalles de la tarea')).toBeTruthy()
    expect(screen.getByText(subtaskFixture.details)).toBeTruthy()
    expect(screen.queryByRole('menu')).toBeNull()

    await user.click(actionsButton)
    await user.click(screen.getByRole('menuitem', { name: `Ocultar detalle de ${subtaskFixture.name}` }))

    expect(screen.queryByText('Detalles de la tarea')).toBeNull()
    expect(screen.queryByText(subtaskFixture.details)).toBeNull()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('mantiene Ver detalle disponible para tareas completadas', async () => {
    const user = userEvent.setup()
    const completedSubtask = { ...subtaskFixture, state: 'completed' as const }
    render(<EventTaskCard subtask={completedSubtask} />)

    await user.click(screen.getByRole('button', { name: `Más acciones para ${completedSubtask.name}` }))

    expect(screen.getByRole('menuitem', { name: `Ver detalle de ${completedSubtask.name}` })).toBeTruthy()
  })

  it('separa el estado Pendiente de la situación Próxima de su fecha', () => {
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
    expect(screen.getByText('Próxima')).toBeTruthy()
    expect(screen.getByText(/2,5 h/).parentElement?.parentElement?.className).toContain('text-[#175cd3]')
  })

  it('separa el estado Pendiente de la situación Vencida de su fecha', () => {
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
    expect(screen.getByText('Pendiente')).toBeTruthy()
  })

  it('muestra una tarea pospuesta sin fecha ni prioridad activa con acento accesible WCAG', async () => {
    const user = userEvent.setup()
    const subtask = {
      ...subtaskFixture,
      state: 'postponed' as const,
      targetDate: '2026-09-23T12:00:00.000Z',
    }
    const { container } = render(<EventTaskCard subtask={subtask} />)

    expect(screen.getByText('Pospuesta')).toBeTruthy()
    expect(screen.getByText('Sin fecha')).toBeTruthy()
    expect(screen.getByText('No cuenta en la carga planificada')).toBeTruthy()
    expect(screen.queryByText('Vencida')).toBeNull()
    expect(screen.getByRole('button', { name: `Registrar avance de ${subtask.name}` })).toBeTruthy()

    // Verificación de contraste WCAG 1.4.11 (acento pospuesto con token #667085)
    const accentBar = container.querySelector('.bg-\\[\\#667085\\]')
    expect(accentBar).not.toBeNull()

    await user.click(screen.getByRole('button', { name: `Más acciones para ${subtask.name}` }))
    expect(screen.queryByRole('menuitem', { name: `Reprogramar ${subtask.name}` })).toBeNull()
    expect(screen.getByRole('menuitem', { name: `Ver detalle de ${subtask.name}` })).toBeTruthy()
  })

  it.each(['2026-10-02T15:00:00Z', '2026-10-03T02:30:00Z', '2026-10-03T04:59:00Z'])('mantiene el día y la prioridad de Bogotá a las %s', (now) => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(now))
    render(<EventTaskCard subtask={{ ...subtaskFixture, targetDate: '2026-10-03T04:59:59Z' }} />)
    expect(screen.getByText(/2 oct/)).toBeTruthy()
    expect(screen.getByText(/2,5 h/)).toBeTruthy()
    expect(screen.getByText('Hoy')).toBeTruthy()
  })

  it('muestra mensaje por defecto en detalles cuando la subtarea no tiene notas', async () => {
    const user = userEvent.setup()
    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          details: '',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: subtaskFixture.name }))
    expect(screen.getByText('Esta tarea no tiene notas adicionales.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Nota' })).toBeNull()
  })

  it('muestra mensaje por defecto en detalles cuando details solo contiene espacios', async () => {
    const user = userEvent.setup()
    render(
      <EventTaskCard
        subtask={{
          ...subtaskFixture,
          details: '   ',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: subtaskFixture.name }))
    expect(screen.getByText('Esta tarea no tiene notas adicionales.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Nota' })).toBeNull()
  })
})
