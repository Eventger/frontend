import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TodayTaskCard } from '@/features/today/components/TodayTaskCard'
import type { TodayTaskItem } from '@/features/today/types/today.types'

const mockTask: TodayTaskItem = {
  id: 1,
  eventId: 10,
  eventName: 'Lanzamiento de Producto',
  name: 'Diseñar Mockups',
  targetDate: '2026-10-15',
  estimatedHours: 2.5,
}

describe('TodayTaskCard', () => {
  it('debe renderizar el título, evento, fecha formateada y horas', () => {
    render(
      <TodayTaskCard
        task={mockTask}
        group="today"
        onOpenTask={vi.fn()}
      />
    )

    expect(screen.getByText('Diseñar Mockups')).toBeDefined()
    expect(screen.getByText(/Lanzamiento de Producto/i)).toBeDefined()
    expect(screen.getByText(/2.5 h/i)).toBeDefined()
    expect(screen.getByText('Hoy')).toBeDefined()
  })

  it('debe mostrar la etiqueta correspondiente al grupo de la tarea', () => {
    const { rerender } = render(
      <TodayTaskCard task={mockTask} group="overdue" onOpenTask={vi.fn()} />
    )
    expect(screen.getByText('Vencida')).toBeDefined()

    rerender(<TodayTaskCard task={mockTask} group="upcoming" onOpenTask={vi.fn()} />)
    expect(screen.getByText('Próxima')).toBeDefined()
  })

  it('debe disparar onOpenTask al hacer clic en el botón de overlay', async () => {
    const user = userEvent.setup()
    const onOpenTask = vi.fn()

    render(
      <TodayTaskCard
        task={mockTask}
        group="today"
        onOpenTask={onOpenTask}
      />
    )

    const overlayButton = screen.getByRole('button', { name: /Ver tarea: Diseñar Mockups/i })
    await user.click(overlayButton)

    expect(onOpenTask).toHaveBeenCalledWith(mockTask)
  })
})