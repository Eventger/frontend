import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import { eventFixture, subtaskFixture } from './subtask.fixtures'

describe('EventDetailContent', () => {
  it('muestra el estado vacío y permite agregar una tarea', async () => {
    const user = userEvent.setup()
    const onAddTask = vi.fn()
    const onEditEvent = vi.fn()

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={[]}
        onAddTask={onAddTask}
        onEditEvent={onEditEvent}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Aún no tienes tareas para este evento',
      }),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Gestionar tareas del evento' }))
    expect(onEditEvent).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))
    expect(onAddTask).toHaveBeenCalledOnce()
  })

  it('renderiza una tarjeta por subtarea y el progreso real', () => {
    const onAddTask = vi.fn()
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
        onEditEvent={onEditEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Coordinar transporte' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Confirmar invitados' }),
    ).toBeTruthy()
    expect(screen.getByText('50%')).toBeTruthy()
    expect(screen.getByText('1 de 2 tareas completadas.')).toBeTruthy()

    const taskList = screen.getByRole('region', {
      name: 'Lista de tareas del evento',
    })

    expect(taskList.classList.contains('event-task-list')).toBe(true)
    expect(taskList.getAttribute('tabindex')).toBe('0')

    expect(
      within(taskList).queryByRole('button', {
        name: 'Editar',
      }),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Agregar tarea' })).toBeNull()
    expect(
      within(taskList).queryByRole('button', {
        name: 'Eliminar',
      }),
    ).toBeNull()
  })
})
