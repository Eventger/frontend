import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'

import { EditEventForm } from '@/features/events/components/edit/EditEventForm'
import { ApiError } from '@/lib/api'
import { dayPlan } from './planning.fixtures'
import {
  createSubtaskInputFixture,
  eventFixture,
  subtaskApiFixture,
  subtaskFixture,
} from './subtask.fixtures'

const eventTypes = [
  {
    id: eventFixture.typeId,
    name: 'Boda',
    description: 'Evento de boda.',
  },
]

function renderForm(
  onSubmit = vi.fn().mockResolvedValue(undefined),
  overrides: Partial<ComponentProps<typeof EditEventForm>> = {},
) {
  render(
    <EditEventForm
      event={eventFixture}
      eventTypes={eventTypes}
      isSubmitting={false}
      onSubmit={onSubmit}
      onCancel={vi.fn()}
      {...overrides}
    />,
  )

  return onSubmit
}

describe('EditEventForm', () => {
  it.each(['2026-10-21T04:59:59.000Z', '2026-10-20T23:59:59-05:00', '2026-10-20'])('mantiene la fecha de Bogotá en la lista y al editar o reprogramar %s', async (targetDate) => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true, data: dayPlan('2026-10-20', subtaskFixture.estimatedHours),
    }), { headers: { 'Content-Type': 'application/json' } })))
    renderForm(undefined, { subtasks: [{ ...subtaskFixture, targetDate }] })
    const tasks = screen.getByRole('list', { name: 'Tareas agregadas' })
    expect(within(tasks).getByText('20/10/2026').getAttribute('datetime')).toBe('2026-10-20')

    await user.click(screen.getByRole('button', { name: `Editar ${subtaskFixture.name}` }))
    expect((screen.getByLabelText('Fecha límite *') as HTMLInputElement).value).toBe('2026-10-20')
    await user.click(screen.getByRole('button', { name: `Reprogramar ${subtaskFixture.name}` }))
    expect((screen.getByLabelText('Nueva fecha') as HTMLInputElement).value).toBe('2026-10-20')
  })

  it.each([false, true])('conserva el borrador del evento al resolver=%s y el de la tarea al cancelar', async (resolve) => {
    const user = userEvent.setup()
    const writes: Record<string, unknown>[] = []
    const onSubtasksChanged = vi.fn()
    const onUpdateSubtask = vi.fn().mockRejectedValue(new ApiError(409, {
      success: false, data: dayPlan('2026-10-12', 2.5),
    }))
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body))
      const headers = { 'Content-Type': 'application/json' }
      if (url.endsWith('/reschedule-preview/')) {
        return new Response(JSON.stringify({ success: true, data: dayPlan(body.target_date, Number(body.estimated_hours)) }), { headers })
      }
      writes.push(body)
      return new Response(JSON.stringify({ success: true, data: { ...subtaskApiFixture, ...body }, planning: dayPlan('2026-10-12', Number(body.estimated_hours)) }), { headers })
    }))
    renderForm(undefined, { subtasks: [subtaskFixture], onUpdateSubtask, onSubtasksChanged })
    await user.clear(screen.getByLabelText('Contacto *'))
    await user.type(screen.getByLabelText('Contacto *'), 'Contacto sin guardar')
    await user.click(screen.getByRole('button', { name: `Editar ${subtaskFixture.name}` }))
    await user.clear(screen.getByLabelText('Nombre de la tarea *'))
    await user.type(screen.getByLabelText('Nombre de la tarea *'), 'Transporte actualizado')
    await user.clear(screen.getByLabelText('Nota opcional'))
    await user.type(screen.getByLabelText('Nota opcional'), 'Nota sin perder')
    fireEvent.change(screen.getByLabelText('Fecha límite *'), { target: { value: '2026-10-12' } })
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))
    await screen.findByText('7,5 h / 6 h')

    if (resolve) {
      await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
      await user.click(screen.getByRole('radio', { name: /Reducir el tiempo estimado/ }))
      fireEvent.change(screen.getByLabelText('Horas estimadas'), { target: { value: '1' } })
      await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
      await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
      await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
      await user.click(screen.getByRole('button', { name: 'Volver al plan' }))
      expect(writes).toHaveLength(1)
      expect(writes[0]).toMatchObject({ name: 'Transporte actualizado', details: 'Nota sin perder', state: 'pending', estimated_hours: '1.00' })
      expect(onSubtasksChanged).toHaveBeenCalledOnce()
      expect(onSubtasksChanged).toHaveBeenCalledWith(expect.objectContaining({ name: 'Transporte actualizado', estimatedHours: 1, details: 'Nota sin perder', state: 'pending' }))
      expect((screen.getByLabelText('Nombre de la tarea *') as HTMLInputElement).value).toBe('')
    } else {
      await user.click(screen.getByRole('button', { name: 'Cancelar reprogramación' }))
      expect(writes).toHaveLength(0)
      expect(onSubtasksChanged).not.toHaveBeenCalled()
      expect((screen.getByLabelText('Nombre de la tarea *') as HTMLInputElement).value).toBe('Transporte actualizado')
      expect((screen.getByLabelText('Nota opcional') as HTMLTextAreaElement).value).toBe('Nota sin perder')
      expect((screen.getByLabelText('Fecha límite *') as HTMLInputElement).value).toBe('2026-10-12')
    }
    expect((screen.getByLabelText('Contacto *') as HTMLInputElement).value).toBe('Contacto sin guardar')
  })

  it('precarga, actualiza y envía el contacto', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()
    const contactInput = screen.getByLabelText('Contacto *')

    expect((contactInput as HTMLInputElement).value).toBe(
      eventFixture.contact,
    )

    await user.clear(contactInput)
    await user.type(contactInput, '  Daniel 3109876543  ')
    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith({
      name: eventFixture.name,
      typeId: eventFixture.typeId,
      eventDate: '2026-10-24',
      location: eventFixture.location,
      contact: 'Daniel 3109876543',
    })
  })

  it('no envía el formulario cuando el contacto está vacío', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.clear(screen.getByLabelText('Contacto *'))
    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(
      screen.getByText('Ingresa un contacto para el evento.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('usa los mensajes de fecha definidos en Figma', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.clear(screen.getByLabelText('Fecha del evento *'))
    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(screen.getByText('Selecciona una fecha válida.')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Fecha del evento *'), '2026-10-24')
    await user.type(screen.getByLabelText('Nombre de la tarea *'), 'Transporte')
    await user.type(screen.getByLabelText('Fecha límite *'), '2026-10-25')
    await user.type(screen.getByLabelText('Tiempo estimado *'), '1')
    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    expect(
      screen.getByText('La fecha límite debe ser anterior al 24/10/2026.'),
    ).toBeTruthy()
  })

  it('valida y crea una tarea desde el formulario de edición', async () => {
    const user = userEvent.setup()
    const onCreateSubtask = vi.fn().mockResolvedValue(undefined)
    renderForm(undefined, { onCreateSubtask })

    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    expect(screen.getByText('Ingresa el nombre de la tarea.')).toBeTruthy()
    expect(screen.getByText('Selecciona la fecha límite.')).toBeTruthy()
    expect(
      screen.getByText('Ingresa un tiempo estimado válido.'),
    ).toBeTruthy()

    await user.type(
      screen.getByLabelText('Nombre de la tarea *'),
      `  ${createSubtaskInputFixture.name}  `,
    )
    await user.type(
      screen.getByLabelText('Fecha límite *'),
      createSubtaskInputFixture.targetDate,
    )
    await user.type(
      screen.getByLabelText('Tiempo estimado *'),
      String(createSubtaskInputFixture.estimatedHours),
    )
    await user.type(
      screen.getByLabelText('Nota opcional'),
      `  ${createSubtaskInputFixture.details}  `,
    )
    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    await waitFor(() => {
      expect(onCreateSubtask).toHaveBeenCalledWith(
        createSubtaskInputFixture,
      )
    })
    expect(
      (screen.getByLabelText('Nombre de la tarea *') as HTMLInputElement).value,
    ).toBe('')
    expect(
      (screen.getByLabelText('Nota opcional') as HTMLTextAreaElement).value,
    ).toBe('')
  })

  it('edita y elimina una tarea existente', async () => {
    const user = userEvent.setup()
    const onUpdateSubtask = vi.fn().mockResolvedValue(undefined)
    const onDeleteSubtask = vi.fn().mockResolvedValue(undefined)
    renderForm(undefined, {
      subtasks: [subtaskFixture],
      onUpdateSubtask,
      onDeleteSubtask,
    })

    await user.click(
      screen.getByRole('button', {
        name: `Editar ${subtaskFixture.name}`,
      }),
    )
    const nameInput = screen.getByLabelText('Nombre de la tarea *')
    expect((nameInput as HTMLInputElement).value).toBe(subtaskFixture.name)

    await user.clear(nameInput)
    await user.type(nameInput, 'Transporte actualizado')
    await user.click(screen.getByRole('combobox', { name: 'Estado de la tarea' }))
    await user.click(screen.getByRole('option', { name: 'Completada' }))
    await user.click(
      screen.getByRole('button', { name: 'Guardar tarea' }),
    )

    await waitFor(() => {
      expect(onUpdateSubtask).toHaveBeenCalledWith(subtaskFixture, {
        ...createSubtaskInputFixture,
        name: 'Transporte actualizado',
        state: 'completed',
      })
    })

    await user.click(
      screen.getByRole('button', {
        name: `Editar ${subtaskFixture.name}`,
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: `Eliminar ${subtaskFixture.name}`,
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Eliminar tarea' }),
    )

    await waitFor(() => {
      expect(onDeleteSubtask).toHaveBeenCalledWith(subtaskFixture)
    })
    expect(screen.queryByRole('heading', { name: '¿Eliminar tarea?' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Agregar tarea' })).toBeTruthy()
  })

  it('permite reintentar cuando guardar o eliminar una tarea falla', async () => {
    const user = userEvent.setup()
    const onCreateSubtask = vi.fn().mockRejectedValue(new Error('falló'))
    const onDeleteSubtask = vi.fn().mockRejectedValue(new Error('falló'))
    renderForm(undefined, {
      subtasks: [subtaskFixture],
      onCreateSubtask,
      onDeleteSubtask,
    })

    await user.type(
      screen.getByLabelText('Nombre de la tarea *'),
      createSubtaskInputFixture.name,
    )
    await user.type(
      screen.getByLabelText('Fecha límite *'),
      createSubtaskInputFixture.targetDate,
    )
    await user.type(
      screen.getByLabelText('Tiempo estimado *'),
      String(createSubtaskInputFixture.estimatedHours),
    )
    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    expect(
      await screen.findByText(
        'No pudimos guardar la tarea. Inténtalo de nuevo.',
      ),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', {
        name: `Eliminar ${subtaskFixture.name}`,
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Eliminar tarea' }),
    )

    expect(
      await screen.findByText(
        'No pudimos eliminar la tarea. Inténtalo de nuevo.',
      ),
    ).toBeTruthy()
    expect(screen.queryByRole('heading', { name: '¿Eliminar tarea?' })).toBeNull()
  })
  it('enfoca el primer campo inválido al guardar el evento', async () => {
    const user = userEvent.setup()
    renderForm()
    const contact = screen.getByLabelText('Contacto *')
    await user.clear(contact)
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(document.activeElement).toBe(contact)
  })

  it('no descarta una tarea pendiente al guardar el evento', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()
    await user.type(screen.getByLabelText('Nombre de la tarea *'), 'Borrador')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Tienes una tarea sin agregar o guardar. Agrégala, guárdala o limpia sus campos antes de continuar.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Limpiar tarea' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('impide guardar o salir mientras una tarea se está guardando', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(undefined, { subtasks: [subtaskFixture], onUpdateSubtask: () => new Promise(() => {}) })
    await user.click(screen.getByRole('button', { name: `Editar ${subtaskFixture.name}` }))
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))
    expect((screen.getByRole('button', { name: 'Guardar cambios' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Cancelar' }) as HTMLButtonElement).disabled).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
  })

})
