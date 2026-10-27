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
  state: 'pending',
  details: '',
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

  it('no muestra el botón de ver notas inline y permite alternar detalles desde el menú de acciones', async () => {
    const user = userEvent.setup()
    const onOpenTask = vi.fn()
    const taskWithNotes = { ...mockTask, details: 'Revisar paleta de colores con el diseñador' }

    render(
      <TodayTaskCard
        task={taskWithNotes}
        group="today"
        onOpenTask={onOpenTask}
      />
    )

    expect(screen.queryByText(/Ver notas/i)).toBeNull()
    const actionsButton = screen.getByRole('button', { name: /Acciones de Diseñar Mockups/i })
    await user.click(actionsButton)
    await user.click(screen.getByRole('menuitem', { name: /Ver detalles de Diseñar Mockups/i }))

    expect(screen.getByText('Revisar paleta de colores con el diseñador')).toBeTruthy()
    expect(onOpenTask).not.toHaveBeenCalled()
  })

  it('aplica estilos de resaltado cuando isHighlighted es true', () => {
    const { container, rerender } = render(
      <TodayTaskCard
        task={mockTask}
        group="today"
        isHighlighted={false}
        onOpenTask={vi.fn()}
      />
    )
    const card = container.querySelector('article')
    expect(card?.className).toContain('border-border-subtle')
    expect(card?.className).not.toContain('border-[#4f46e5]')

    rerender(
      <TodayTaskCard
        task={mockTask}
        group="today"
        isHighlighted={true}
        onOpenTask={vi.fn()}
      />
    )
    expect(card?.className).toContain('border-[#4f46e5]')
    expect(card?.className).toContain('bg-[#fafaff]')
    expect(card?.className).toContain('ring-2')
  })

  it('ejecuta callbacks onMouseEnter, onFocus y onClick', async () => {
    const user = userEvent.setup()
    const onMouseEnter = vi.fn()
    const onFocus = vi.fn()
    const onClick = vi.fn()

    const { container } = render(
      <TodayTaskCard
        task={mockTask}
        group="today"
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        onClick={onClick}
        onOpenTask={vi.fn()}
      />
    )

    const card = container.querySelector('article')!
    await user.hover(card)
    expect(onMouseEnter).toHaveBeenCalled()

    await user.click(card)
    expect(onClick).toHaveBeenCalled()

    const button = screen.getByRole('button', { name: /Ver tarea: Diseñar Mockups/i })
    button.focus()
    expect(onFocus).toHaveBeenCalled()
  })

  it('permite abrir el evento al pulsar el nombre del evento', async () => {
    const user = userEvent.setup()
    const onOpenTask = vi.fn()

    render(
      <TodayTaskCard
        task={mockTask}
        group="today"
        onOpenTask={onOpenTask}
      />
    )

    const eventButton = screen.getByRole('button', { name: /Lanzamiento de Producto/i })
    await user.click(eventButton)
    expect(onOpenTask).toHaveBeenCalledWith(mockTask)
  })
})