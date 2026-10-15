import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TodayTaskSection } from '@/features/today/components/TodayTaskSection'
import type { TodayTaskItem } from '@/features/today/types/today.types'

const mockTasks: TodayTaskItem[] = [
  {
    id: 1,
    eventId: 10,
    eventName: 'Evento A',
    name: 'Subtarea 1',
    targetDate: '2026-10-15',
    estimatedHours: 2,
  },
  {
    id: 2,
    eventId: 10,
    eventName: 'Evento A',
    name: 'Subtarea 2',
    targetDate: '2026-10-15',
    estimatedHours: 1,
  },
]

describe('TodayTaskSection', () => {
  it('no debe renderizar nada si el listado de tareas está vacío', () => {
    const { container } = render(
      <TodayTaskSection
        title="Vencidas"
        tasks={[]}
        group="overdue"
        onOpenTask={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('debe renderizar el título, el contador y la lista de tarjetas', () => {
    render(
      <TodayTaskSection
        title="Para hoy"
        description="Tareas agendadas para la jornada"
        tasks={mockTasks}
        group="today"
        onOpenTask={vi.fn()}
      />
    )

    expect(screen.getByText('Para hoy')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined() // Badge del contador
    expect(screen.getByText('Tareas agendadas para la jornada')).toBeDefined()
    expect(screen.getByText('Subtarea 1')).toBeDefined()
    expect(screen.getByText('Subtarea 2')).toBeDefined()
  })
})