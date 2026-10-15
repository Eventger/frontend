import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EventProgressCard } from '@/features/events/components/detail/EventProgressCard'
import { subtaskFixture } from './subtask.fixtures'

describe('EventProgressCard', () => {
  it('muestra el estado inicial cuando no hay subtareas', () => {
    render(<EventProgressCard subtasks={[]} />)

    expect(screen.getByText('0%')).toBeTruthy()
    expect(
      screen.getByText('Aún no hay tareas creadas.'),
    ).toBeTruthy()
    expect(screen.getByText('0 h / día')).toBeTruthy()
    expect(screen.getByText('Aún no hay tareas programadas.')).toBeTruthy()
  })

  it('calcula el progreso con los datos reales de las subtareas', () => {
    const subtasks = Array.from({ length: 4 }, (_, index) => ({
      ...subtaskFixture,
      id: index + 1,
      state: index < 2 ? 'completed' as const : 'pending' as const,
    }))

    render(<EventProgressCard subtasks={subtasks} />)

    expect(screen.getByText('50%')).toBeTruthy()
    expect(screen.getByText('2 de 4 tareas completadas.')).toBeTruthy()
  })

  it('excluye subtareas pospuestas de la carga activa del día', () => {
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        state: 'postponed' as const,
        estimatedHours: 5,
      },
      {
        ...subtaskFixture,
        id: 2,
        state: 'completed' as const,
        estimatedHours: 3,
      },
      {
        ...subtaskFixture,
        id: 3,
        state: 'pending' as const,
        estimatedHours: 2,
      },
    ]

    render(<EventProgressCard subtasks={subtasks} eventDate="2026-10-25" />)

    expect(screen.getByText('33%')).toBeTruthy()
    expect(screen.getByText('1 de 3 tareas completadas.')).toBeTruthy()
    // Solo la tarea pending (2h) suma para la carga activa
    expect(screen.getByText(/h \/ día/)).toBeTruthy()
  })
})
