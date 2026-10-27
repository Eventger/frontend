import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { EditSubtaskDialog } from '@/features/events/components/detail/EditSubtaskDialog'
import type { CreateSubtaskInput } from '@/features/events/types/subtask.types'
import { formatDateInput } from '@/lib/calendar'
import {
  eventFixture,
  subtaskFixture,
} from './subtask.fixtures'

type RenderOptions = {
  isSubmitting?: boolean
  dailyLimitHours?: number
  onClose?: () => void
  onSubmit?: (
    data: CreateSubtaskInput,
  ) => Promise<void> | void
}

function renderDialog({
  isSubmitting = false,
  dailyLimitHours,
  onClose = vi.fn(),
  onSubmit = vi.fn(),
}: RenderOptions = {}) {
  render(
    <EditSubtaskDialog
      subtask={subtaskFixture}
      eventDate={eventFixture.eventDate}
      isSubmitting={isSubmitting}
      dailyLimitHours={dailyLimitHours}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
  )

  return { onClose, onSubmit }
}

describe('EditSubtaskDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-08T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('conserva la fecha de Bogotá al guardar una tarea recibida en UTC sin cambios', async () => {
    const onSubmit = vi.fn()
    render(<EditSubtaskDialog subtask={{ ...subtaskFixture, targetDate: '2026-10-03T04:59:59Z' }} eventDate="2026-10-25T04:59:59Z" onClose={vi.fn()} onSubmit={onSubmit} />)
    const date = screen.getByLabelText('Fecha límite *') as HTMLInputElement
    expect(date.value).toBe('02/10/2026')
    expect(date.max).toBe('2026-10-24')
    expect(screen.getByText('Debe completarse antes del 24 de octubre de 2026.')).toBeTruthy()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ targetDate: '2026-10-02' }))
  })

  it('rechaza una tarea posterior al día del evento en Bogotá', async () => {
    const onSubmit = vi.fn()
    render(<EditSubtaskDialog subtask={{ ...subtaskFixture, targetDate: '2026-10-26T04:59:59Z' }} eventDate="2026-10-25T04:59:59Z" onClose={vi.fn()} onSubmit={onSubmit} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('La fecha límite debe ser anterior a la fecha del evento.')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra los datos actuales de la subtarea', () => {
    renderDialog()

    expect(
      screen.getByRole('heading', { name: 'Editar tarea' }),
    ).toBeTruthy()
    expect(
      (screen.getByLabelText('Nombre de la tarea *') as HTMLInputElement).value,
    ).toBe(subtaskFixture.name)
    expect(
      (screen.getByLabelText('Fecha límite *') as HTMLInputElement).value,
    ).toBe(formatDateInput(subtaskFixture.targetDate))
    expect(
      (screen.getByLabelText('Tiempo estimado *') as HTMLInputElement).value,
    ).toBe(String(subtaskFixture.estimatedHours))
    expect(
      (screen.getByLabelText('Nota (opcional)') as HTMLTextAreaElement).value,
    ).toBe(subtaskFixture.details)
  })

  it('valida los campos obligatorios y no envía', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderDialog()

    await user.clear(screen.getByLabelText('Nombre de la tarea *'))
    await user.clear(screen.getByLabelText('Fecha límite *'))
    await user.clear(screen.getByLabelText('Tiempo estimado *'))
    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(screen.getByText('Ingresa el nombre de la tarea.')).toBeTruthy()
    expect(screen.getByText('Selecciona la fecha límite.')).toBeTruthy()
    expect(
      screen.getByText('Ingresa un tiempo estimado válido.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre de la tarea *'))
  })

  it('rechaza horas no positivas y una fecha posterior al evento', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderDialog()

    const dateInput = screen.getByLabelText('Fecha límite *')
    await user.clear(dateInput)
    await user.type(dateInput, '25/10/2026')

    const hoursInput = screen.getByLabelText('Tiempo estimado *')
    await user.clear(hoursInput)
    await user.type(hoursInput, '0')

    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(
      screen.getByText(
        'La fecha límite debe ser anterior a la fecha del evento.',
      ),
    ).toBeTruthy()
    expect(
      screen.getByText('Ingresa un tiempo estimado válido.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía una sola vez los datos editados válidos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog({ onSubmit })

    const nameInput = screen.getByLabelText('Nombre de la tarea *')
    const dateInput = screen.getByLabelText('Fecha límite *')
    const hoursInput = screen.getByLabelText('Tiempo estimado *')
    const detailsInput = screen.getByLabelText('Nota (opcional)')

    await user.clear(nameInput)
    await user.type(nameInput, '  Confirmar proveedores  ')
    await user.clear(dateInput)
    await user.type(dateInput, '23/10/2026')
    await user.clear(hoursInput)
    await user.type(hoursInput, '3.5')
    await user.clear(detailsInput)
    await user.type(detailsInput, '  Llamar por la mañana.  ')
    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Confirmar proveedores',
      targetDate: '2026-10-23',
      estimatedHours: 3.5,
      details: 'Llamar por la mañana.',
    })
  })

  it('cierra al cancelar sin enviar', async () => {
    const user = userEvent.setup()
    const { onClose, onSubmit } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('cierra con Escape sin enviar', async () => {
    const user = userEvent.setup()
    const { onClose, onSubmit } = renderDialog()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('bloquea campos y acciones durante el envío', async () => {
    const user = userEvent.setup()
    const { onClose, onSubmit } = renderDialog({ isSubmitting: true })

    expect(
      (screen.getByLabelText('Nombre de la tarea *') as HTMLInputElement)
        .disabled,
    ).toBe(true)
    expect(
      (screen.getByRole('button', { name: 'Cancelar' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(
      (screen.getByRole('button', { name: 'Guardando…' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('button', { name: 'Guardando…' }))
    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rechaza un tiempo estimado que supera el límite diario', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderDialog({ dailyLimitHours: 4 })

    const hoursInput = screen.getByLabelText('Tiempo estimado *')
    await user.clear(hoursInput)
    await user.type(hoursInput, '5')

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      screen.getByText('El tiempo estimado no puede superar tu límite diario de 4 h.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
