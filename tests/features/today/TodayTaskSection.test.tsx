import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    state: 'pending',
    details: '',
  },
  {
    id: 2,
    eventId: 10,
    eventName: 'Evento A',
    name: 'Subtarea 2',
    targetDate: '2026-10-15',
    estimatedHours: 1,
    state: 'pending',
    details: '',
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
    expect(screen.queryByRole('button', { name: /Ver todas las tareas/ })).toBeNull()
  })

  it('muestra tres tareas y permite ver todas sin cambiar las tarjetas', async () => {
    const user = userEvent.setup()
    const tasks = Array.from({ length: 5 }, (_, index) => ({
      ...mockTasks[0],
      id: index + 1,
      name: `Subtarea ${index + 1}`,
    }))

    render(
      <TodayTaskSection
        title="Vencidas"
        tasks={tasks}
        group="overdue"
        onOpenTask={vi.fn()}
      />
    )

    const toggle = screen.getByRole('button', {
      name: 'Ver todas las tareas de Vencidas (5)',
    })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText('Subtarea 3')).toBeDefined()
    expect(screen.queryByText('Subtarea 4')).toBeNull()

    await user.click(toggle)

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Subtarea 4')).toBeDefined()
    expect(screen.getByText('Subtarea 5')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Ver menos tareas de Vencidas' })).toBe(toggle)

    await user.click(toggle)

    expect(screen.queryByText('Subtarea 4')).toBeNull()
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })
})
