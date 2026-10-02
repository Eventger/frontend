import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'

import { EditEventForm } from '@/features/events/components/edit/EditEventForm'
import {
  createSubtaskInputFixture,
  eventFixture,
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
})
