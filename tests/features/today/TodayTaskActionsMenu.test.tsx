import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TodayTaskActionsMenu } from '@/features/today/components/TodayTaskActionsMenu'
import type { TodayTaskItem } from '@/features/today/types/today.types'

const mockTask: TodayTaskItem = {
  id: 1,
  eventId: 10,
  eventName: 'Evento Test',
  name: 'Tarea Test Menu',
  targetDate: '2026-10-20',
  estimatedHours: 3,
  state: 'pending',
  details: '',
}

describe('TodayTaskActionsMenu', () => {
  it('debe abrir y cerrar el menú al hacer clic en el botón activador', async () => {
    const user = userEvent.setup()
    render(
      <TodayTaskActionsMenu
        task={mockTask}
        onRegisterProgress={vi.fn()}
        onReschedule={vi.fn()}
        onViewDetails={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Acciones de Tarea Test Menu/i })
    expect(screen.queryByRole('menu')).toBeNull()

    // Abrir menú
    await user.click(trigger)
    expect(screen.getByRole('menu')).toBeDefined()

    // Cerrar menú con otra interacción
    await user.click(trigger)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('debe ejecutar las acciones correspondientes al seleccionar cada opción', async () => {
    const user = userEvent.setup()
    const onRegisterProgress = vi.fn()
    const onReschedule = vi.fn()
    const onViewDetails = vi.fn()

    render(
      <TodayTaskActionsMenu
        task={mockTask}
        onRegisterProgress={onRegisterProgress}
        onReschedule={onReschedule}
        onViewDetails={onViewDetails}
      />
    )

    const trigger = screen.getByRole('button', { name: /Acciones de Tarea Test Menu/i })

    // Registrar avance
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /Registrar avance/i }))
    expect(onRegisterProgress).toHaveBeenCalledWith(mockTask)

    // Reprogramar
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /Reprogramar/i }))
    expect(onReschedule).toHaveBeenCalledWith(mockTask)

    // Ver detalles
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /Ver detalles/i }))
    expect(onViewDetails).toHaveBeenCalledWith(mockTask)
  })

  it('debe cerrar el menú al presionar la tecla Escape', async () => {
    const user = userEvent.setup()
    render(
      <TodayTaskActionsMenu
        task={mockTask}
        onRegisterProgress={vi.fn()}
        onReschedule={vi.fn()}
        onViewDetails={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Acciones de Tarea Test Menu/i })
    await user.click(trigger)
    expect(screen.getByRole('menu')).toBeDefined()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('no debe mostrar la opción de editar detalles en el menú', async () => {
    const user = userEvent.setup()

    render(
      <TodayTaskActionsMenu
        task={mockTask}
        onRegisterProgress={vi.fn()}
        onReschedule={vi.fn()}
        onViewDetails={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Acciones de Tarea Test Menu/i })
    await user.click(trigger)

    expect(screen.queryByRole('menuitem', { name: /Editar detalles/i })).toBeNull()
  })
})