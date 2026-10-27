import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DailyLimitDialog } from '@/features/today/components/DailyLimitDialog'
import { DailyLimitConflictError } from '@/features/settings/utils/preferences'

describe('DailyLimitDialog', () => {
  it('renderiza título, pregunta, valor inicial y unidad', () => {
    render(
      <DailyLimitDialog
        open={true}
        onOpenChange={vi.fn()}
        currentHours={6}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Tus horas disponibles' })).toBeDefined()
    expect(screen.getByText('¿Cuántas horas al día puedes dedicar a tus tareas?')).toBeDefined()
    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('6')
    expect(screen.getByText('horas / día')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDefined()
  })

  it('no muestra tooltip ni botón de ayuda en el modal', () => {
    render(
      <DailyLimitDialog
        open={true}
        onOpenChange={vi.fn()}
        currentHours={6}
        onSave={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Más información sobre horas disponibles' })).toBeNull()
    expect(
      screen.queryByText('Estas horas nos ayudan a identificar cuándo tienes más trabajo programado del que puedes realizar.'),
    ).toBeNull()
  })

  it('valida que el valor esté entre 1 y 16 horas', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <DailyLimitDialog
        open={true}
        onOpenChange={vi.fn()}
        currentHours={6}
        onSave={onSave}
      />,
    )

    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '20')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Ingresa entre 1 y 16 horas al día, con un máximo de dos decimales.')).toBeDefined()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('llama a onSave con el nuevo valor y cierra el diálogo al guardar exitosamente', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()

    render(
      <DailyLimitDialog
        open={true}
        onOpenChange={onOpenChange}
        currentHours={6}
        onSave={onSave}
      />,
    )

    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '4')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(4)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('muestra mensaje claro cuando el sistema rechaza la reducción por tareas existentes', async () => {
    const user = userEvent.setup()
    const conflictError = new DailyLimitConflictError('2026-10-25', 6)
    const onSave = vi.fn().mockRejectedValue(conflictError)
    const onOpenChange = vi.fn()
    const onNavigateToHoy = vi.fn()

    render(
      <DailyLimitDialog
        open={true}
        onOpenChange={onOpenChange}
        currentHours={6}
        onSave={onSave}
        onNavigateToHoy={onNavigateToHoy}
      />,
    )

    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '4')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText(/Tienes 6 h programadas para el/i)).toBeDefined()
    expect(screen.getByText('Revisa las tareas de ese día para reprogramarlas o reducir sus horas.')).toBeDefined()
    expect(onOpenChange).not.toHaveBeenCalled()

    const resolveButton = screen.getByRole('button', { name: 'Ver tareas en Hoy' })
    await user.click(resolveButton)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onNavigateToHoy).toHaveBeenCalled()
  })

  it('cierra el diálogo al pulsar Cancelar sin guardar', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <DailyLimitDialog
        open={true}
        onOpenChange={onOpenChange}
        currentHours={6}
        onSave={onSave}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('permite aumentar y disminuir las horas con los botones del stepper', async () => {
    const user = userEvent.setup()

    render(
      <DailyLimitDialog
        open={true}
        onOpenChange={vi.fn()}
        currentHours={6}
        onSave={vi.fn()}
      />,
    )

    const input = screen.getByRole('spinbutton') as HTMLInputElement
    const decButton = screen.getByRole('button', { name: 'Disminuir horas' })
    const incButton = screen.getByRole('button', { name: 'Aumentar horas' })

    expect(input.value).toBe('6')

    await user.click(incButton)
    expect(input.value).toBe('7')

    await user.click(decButton)
    expect(input.value).toBe('6')

    await user.click(decButton)
    expect(input.value).toBe('5')
  })

  it('deshabilita los botones de incremento y decremento en los límites (1 y 16)', async () => {
    const { rerender } = render(
      <DailyLimitDialog
        open={true}
        onOpenChange={vi.fn()}
        currentHours={1}
        onSave={vi.fn()}
      />,
    )

    const decButton = screen.getByRole('button', { name: 'Disminuir horas' })
    expect((decButton as HTMLButtonElement).disabled).toBe(true)

    rerender(
      <DailyLimitDialog
        open={true}
        onOpenChange={vi.fn()}
        currentHours={16}
        onSave={vi.fn()}
      />,
    )

    const incButton = screen.getByRole('button', { name: 'Aumentar horas' })
    expect((incButton as HTMLButtonElement).disabled).toBe(true)
  })
})
