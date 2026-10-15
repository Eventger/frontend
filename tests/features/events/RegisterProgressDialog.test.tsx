import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterProgressDialog } from '@/features/events/components/detail/RegisterProgressDialog'
import { registerSubtaskProgress } from '@/features/events/services/subtasks.service'
import type { Subtask } from '@/features/events/types/subtask.types'

vi.mock('@/features/events/services/subtasks.service', () => ({
  registerSubtaskProgress: vi.fn(),
}))

describe('RegisterProgressDialog', () => {
  const pendingTask: Subtask = {
    id: 10,
    eventId: 21,
    name: 'Reservar salón',
    targetDate: '2026-10-20',
    estimatedHours: 2.5,
    details: 'Hablar con el administrador',
    state: 'pending',
  }

  const postponedTask: Subtask = {
    id: 11,
    eventId: 21,
    name: 'Contratar música',
    targetDate: '2026-10-22',
    estimatedHours: 3,
    details: 'Presupuesto pendiente',
    state: 'postponed',
  }

  const taskWithoutDetails: Subtask = {
    id: 12,
    eventId: 21,
    name: 'Comprar flores',
    targetDate: '2026-10-21',
    estimatedHours: 1,
    details: '',
    state: 'pending',
  }

  beforeEach(() => {
    vi.mocked(registerSubtaskProgress).mockReset()
  })

  it('renderiza la información de la tarea y el estado por defecto como Hecha cuando la tarea está pendiente', () => {
    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Registrar avance' })).toBeDefined()
    expect(screen.getByText('Actualiza el estado de esta tarea.')).toBeDefined()
    expect(screen.getByText(/Reservar salón · 20 de oct/i)).toBeDefined()

    const hechaBtn = screen.getByRole('button', { name: 'Hecha' })
    const pospuestaBtn = screen.getByRole('button', { name: 'Pospuesta' })

    expect(hechaBtn.getAttribute('aria-pressed')).toBe('true')
    expect(pospuestaBtn.getAttribute('aria-pressed')).toBe('false')
    expect(screen.queryByLabelText(/Nota \(opcional\)/i)).toBeNull()
  })

  it('muestra el campo de nota al seleccionar Pospuesta y permite editarla', async () => {
    const user = userEvent.setup()
    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    const pospuestaBtn = screen.getByRole('button', { name: 'Pospuesta' })
    await user.click(pospuestaBtn)

    expect(pospuestaBtn.getAttribute('aria-pressed')).toBe('true')
    const noteTextarea = screen.getByLabelText(/Nota \(opcional\)/i)
    expect((noteTextarea as HTMLTextAreaElement).value).toBe('Hablar con el administrador')

    await user.clear(noteTextarea)
    await user.type(noteTextarea, 'Nota actualizada')
    expect((noteTextarea as HTMLTextAreaElement).value).toBe('Nota actualizada')

    const hechaBtn = screen.getByRole('button', { name: 'Hecha' })
    await user.click(hechaBtn)
    expect(screen.queryByLabelText(/Nota \(opcional\)/i)).toBeNull()
  })

  it('inicializa el estado en Pospuesta si la tarea ya estaba pospuesta', () => {
    render(
      <RegisterProgressDialog
        task={postponedTask}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    const pospuestaBtn = screen.getByRole('button', { name: 'Pospuesta' })
    expect(pospuestaBtn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByLabelText(/Nota \(opcional\)/i)).toBeDefined()
  })

  it('inicializa nota vacía si details es vacío o indefinido', async () => {
    const user = userEvent.setup()
    render(
      <RegisterProgressDialog
        task={taskWithoutDetails}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pospuesta' }))
    const noteTextarea = screen.getByLabelText(/Nota \(opcional\)/i)
    expect((noteTextarea as HTMLTextAreaElement).value).toBe('')
  })

  it('cierra el diálogo al presionar Cancelar o el botón X', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const { rerender } = render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={onClose}
        onSaved={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()

    onClose.mockReset()
    rerender(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={onClose}
        onSaved={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('guarda el avance como Hecha exitosamente y muestra pantalla de confirmación', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSaved = vi.fn().mockResolvedValue(undefined)
    const updatedTask: Subtask = { ...pendingTask, state: 'completed' }

    vi.mocked(registerSubtaskProgress).mockResolvedValueOnce(updatedTask)

    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={onClose}
        onSaved={onSaved}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambio' }))

    expect(registerSubtaskProgress).toHaveBeenCalledOnce()
    expect(registerSubtaskProgress).toHaveBeenCalledWith(
      pendingTask.id,
      'completed',
      pendingTask.details,
      expect.any(Function),
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Avance registrado' })).toBeDefined()
    })
    expect(
      screen.getByText(/La tarea se actualizó correctamente\. “Reservar salón” fue marcada como hecha\./i),
    ).toBeDefined()
    expect(onSaved).toHaveBeenCalledWith(updatedTask)

    await user.click(screen.getByRole('button', { name: 'Volver al evento' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('guarda el avance como Pospuesta exitosamente y muestra la descripción correspondiente', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSaved = vi.fn()
    const updatedTask: Subtask = { ...postponedTask, state: 'postponed', details: 'Presupuesto pendiente' }

    vi.mocked(registerSubtaskProgress).mockResolvedValueOnce(updatedTask)

    render(
      <RegisterProgressDialog
        task={postponedTask}
        onClose={onClose}
        onSaved={onSaved}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambio' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Avance registrado' })).toBeDefined()
    })
    expect(
      screen.getByText(/“Contratar música” fue marcada como pospuesta y la nota fue guardada\./i),
    ).toBeDefined()
  })

  it('maneja el fallo de guardado mostrando la pantalla de error y permite volver al formulario conservando datos', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSaved = vi.fn()

    vi.mocked(registerSubtaskProgress).mockRejectedValueOnce(new Error('Fallo de red'))

    render(
      <RegisterProgressDialog
        task={postponedTask}
        onClose={onClose}
        onSaved={onSaved}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambio' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cambio no guardado' })).toBeDefined()
    })
    expect(
      screen.getByText(/No pudimos actualizar la tarea\. Ocurrió un problema al guardar el avance\./i),
    ).toBeDefined()
    expect(onSaved).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Volver al evento' }))

    expect(screen.getByRole('heading', { name: 'Registrar avance' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Pospuesta' }).getAttribute('aria-pressed')).toBe('true')
    expect((screen.getByLabelText(/Nota \(opcional\)/i) as HTMLTextAreaElement).value).toBe('Presupuesto pendiente')
  })

  it('no interrumpe el flujo si onSaved arroja un error después de guardar', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn().mockRejectedValue(new Error('Fallo al refrescar lista'))
    const updatedTask: Subtask = { ...pendingTask, state: 'completed' }

    vi.mocked(registerSubtaskProgress).mockResolvedValueOnce(updatedTask)

    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambio' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Avance registrado' })).toBeDefined()
    })
  })

  it('previene el cierre al presionar Escape cuando está en estado de error', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    vi.mocked(registerSubtaskProgress).mockRejectedValueOnce(new Error('Fallo'))

    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={onClose}
        onSaved={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambio' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cambio no guardado' })).toBeDefined()
    })

    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })
})
