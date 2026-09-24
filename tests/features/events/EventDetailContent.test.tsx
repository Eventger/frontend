import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import { eventFixture, subtaskFixture } from './subtask.fixtures'

describe('EventDetailContent', () => {
  it('muestra el estado vacío y permite agregar una tarea', async () => {
    const user = userEvent.setup()
    const onAddTask = vi.fn()

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={[]}
        onAddTask={onAddTask}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Aún no tienes tareas para este evento',
      }),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))
    expect(onAddTask).toHaveBeenCalledOnce()
  })

  it('renderiza una tarjeta por subtarea y el progreso real', async () => {
    const user = userEvent.setup()
    const onAddTask = vi.fn()
    const subtasks = [
      {
        ...subtaskFixture,
        id: 31,
        name: 'Coordinar transporte',
        state: 'completed' as const,
      },
      {
        ...subtaskFixture,
        id: 32,
        name: 'Confirmar invitados',
        state: 'pending' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={onAddTask}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Coordinar transporte' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Confirmar invitados' }),
    ).toBeTruthy()
    expect(screen.getByText('50 %')).toBeTruthy()
    expect(screen.getByText('1 de 2 tareas completadas')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))
    expect(onAddTask).toHaveBeenCalledOnce()
  })
})
