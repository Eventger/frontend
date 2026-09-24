import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import { eventFixture, subtaskFixture } from './subtask.fixtures'

describe('EventDetailContent', () => {
  it('muestra el estado vacío y permite agregar una tarea', async () => {
    const user = userEvent.setup()
    const onAddTask = vi.fn()
    const onEditTask = vi.fn()
    const onDeleteTask = vi.fn()
    const onEditEvent = vi.fn()

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={[]}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onEditEvent={onEditEvent}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Aún no tienes tareas para este evento',
      }),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))
    expect(onAddTask).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Editar evento' }))
    expect(onEditEvent).toHaveBeenCalledOnce()
  })

  it('renderiza una tarjeta por subtarea y el progreso real', async () => {
    const user = userEvent.setup()
    const onAddTask = vi.fn()
    const onEditTask = vi.fn()
    const onDeleteTask = vi.fn()
    const onEditEvent = vi.fn()
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
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onEditEvent={onEditEvent}
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

    const firstTaskCard = screen
      .getByRole('heading', { name: subtasks[0].name })
      .closest('article')
    const secondTaskCard = screen
      .getByRole('heading', { name: subtasks[1].name })
      .closest('article')

    expect(firstTaskCard).not.toBeNull()
    expect(secondTaskCard).not.toBeNull()

    await user.click(
      within(firstTaskCard!).getByRole('button', { name: 'Editar' }),
    )
    await user.click(
      within(secondTaskCard!).getByRole('button', { name: 'Eliminar' }),
    )

    expect(onEditTask).toHaveBeenCalledOnce()
    expect(onEditTask).toHaveBeenCalledWith(subtasks[0])
    expect(onDeleteTask).toHaveBeenCalledOnce()
    expect(onDeleteTask).toHaveBeenCalledWith(subtasks[1])
  })
})
