import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EventProgressCard } from '@/features/events/components/detail/EventProgressCard'
import { subtaskFixture } from './subtask.fixtures'

describe('EventProgressCard', () => {
  it('muestra el estado inicial cuando no hay subtareas', () => {
    render(<EventProgressCard subtasks={[]} />)

    expect(screen.getByText('—')).toBeTruthy()
    expect(
      screen.getByText('Agrega tareas para comenzar a medir el progreso.'),
    ).toBeTruthy()
  })

  it('calcula el progreso con los datos reales de las subtareas', () => {
    const subtasks = Array.from({ length: 4 }, (_, index) => ({
      ...subtaskFixture,
      id: index + 1,
      state: index < 2 ? 'completed' as const : 'pending' as const,
    }))

    render(<EventProgressCard subtasks={subtasks} />)

    expect(screen.getByText('50 %')).toBeTruthy()
    expect(screen.getByText('2 de 4 tareas completadas')).toBeTruthy()
  })
})
