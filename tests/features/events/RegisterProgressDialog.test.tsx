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

  it('renderiza los cuatro estados y selecciona el estado actual de la tarea', () => {
    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Registrar avance' })).toBeDefined()
    expect(screen.getByText('Actualiza el estado de esta tarea.')).toBeDefined()
    expect(screen.getByText('Reservar salón')).toBeDefined()
    expect(screen.getByText('2,5 h')).toBeDefined()
    expect(screen.getByText('¿Qué pasó con esta tarea?')).toBeDefined()
    expect(screen.getByText('Aún falta por realizar')).toBeDefined()
    expect(screen.getByText('La tarea se está realizando')).toBeDefined()
    expect(screen.getByText('La tarea se completó')).toBeDefined()
    expect(screen.getByText('No se puede realizar por ahora')).toBeDefined()
    expect(screen.getByText('Puedes actualizar el estado nuevamente cuando sea necesario.')).toBeDefined()
    expect(screen.getByText(/Reservar salón · 20 de oct/i)).toBeDefined()

    const completadaBtn = screen.getByRole('button', { name: 'Completada' })
    const pospuestaBtn = screen.getByRole('button', { name: 'Pospuesta' })
    const pendienteBtn = screen.getByRole('button', { name: 'Pendiente' })
    const enProgresoBtn = screen.getByRole('button', { name: 'En progreso' })

    expect(pendienteBtn.getAttribute('aria-pressed')).toBe('true')
    expect(enProgresoBtn.getAttribute('aria-pressed')).toBe('false')
    expect(completadaBtn.getAttribute('aria-pressed')).toBe('false')
    expect(pospuestaBtn.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByLabelText(/Nota \(opcional\)/i)).toBeTruthy()
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

    const completadaBtn = screen.getByRole('button', { name: 'Completada' })
    await user.click(completadaBtn)
    expect(screen.getByLabelText(/Nota \(opcional\)/i)).toBeTruthy()
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

  it('guarda el avance como Completada exitosamente y muestra pantalla de confirmación', async () => {
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

    await user.click(screen.getByRole('button', { name: 'Completada' }))
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
      screen.getByText(/La tarea se actualizó correctamente\. “Reservar salón” fue marcada como completada\./i),
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

  it('permite actualizar una tarea a En progreso', async () => {
    const user = userEvent.setup()
    const updatedTask: Subtask = { ...pendingTask, state: 'in_progress' }
    vi.mocked(registerSubtaskProgress).mockResolvedValueOnce(updatedTask)

    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'En progreso' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambio' }))

    expect(registerSubtaskProgress).toHaveBeenCalledWith(
      pendingTask.id,
      'in_progress',
      pendingTask.details,
      expect.any(Function),
    )
    expect(await screen.findByText(/“Reservar salón” fue marcada como en progreso\./i)).toBeTruthy()
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

    await user.click(screen.getByRole('button', { name: 'Volver a intentar' }))

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

  it('garantiza consistencia dimensional idéntica entre las tarjetas de opción en ambos estados', async () => {
    const user = userEvent.setup()
    render(
      <RegisterProgressDialog
        task={pendingTask}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    const completadaBtn = screen.getByRole('button', { name: 'Completada' })
    const pospuestaBtn = screen.getByRole('button', { name: 'Pospuesta' })

    const pendienteBtn = screen.getByRole('button', { name: 'Pendiente' })

    // Estado inicial: Pendiente seleccionado
    expect(pendienteBtn.className).toContain('border-2 border-[#4f46e5]')
    expect(pendienteBtn.className).toContain('h-[78px]')
    expect(completadaBtn.className).toContain('border-2 border-[#eaecf0]')
    expect(completadaBtn.className).toContain('h-[78px]')
    expect(pospuestaBtn.className).toContain('border-2 border-[#eaecf0]')
    expect(pospuestaBtn.className).toContain('h-[78px]')

    // Alternar a Pospuesta seleccionada
    await user.click(pospuestaBtn)
    expect(pendienteBtn.className).toContain('border-2 border-[#eaecf0]')
    expect(completadaBtn.className).toContain('border-2 border-[#eaecf0]')
    expect(completadaBtn.className).toContain('h-[78px]')
    expect(pospuestaBtn.className).toContain('border-2 border-[#4f46e5]')
    expect(pospuestaBtn.className).toContain('h-[78px]')
  })
})
