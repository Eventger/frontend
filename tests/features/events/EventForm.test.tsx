import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventForm } from '@/features/events/components/EventForm'
import { useEventTypes } from '@/features/events/hooks/useEventTypes'
import type { CreateEventInput } from '@/features/events/types/event.types'
import type { CreateSubtaskInput } from '@/features/events/types/subtask.types'

vi.mock('@/features/events/hooks/useEventTypes', () => ({
  useEventTypes: vi.fn(),
}))

const eventType = {
  id: 0,
  name: 'Boda',
  description: 'evento de boda.',
}

const validInput: CreateEventInput = {
  name: 'Boda Laura y Daniel',
  typeId: 0,
  eventDate: '2099-12-31',
  location: 'Hacienda Las Palmas',
  contact: 'Laura 3001234567',
}

const initialSubtasks: CreateSubtaskInput[] = [
  {
    name: 'Reservar salón',
    targetDate: '2099-10-15',
    estimatedHours: 2,
    details: 'Confirmar disponibilidad',
  },
  {
    name: 'Contratar música',
    targetDate: '2099-11-01',
    estimatedHours: 1.5,
    details: '',
  },
]

describe('EventForm', () => {
  beforeEach(() => {
    vi.mocked(useEventTypes).mockReturnValue({
      eventTypes: [eventType],
      isLoading: false,
      error: null,
      retry: vi.fn(),
    })
  })

  it('muestra los errores obligatorios y no envía un formulario vacío', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <EventForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Crear evento' }),
    )

    expect(screen.getByText('Ingresa el nombre del evento.')).toBeTruthy()
    expect(screen.getByText('Selecciona un tipo de evento.')).toBeTruthy()
    expect(screen.getByText('Selecciona una fecha válida.')).toBeTruthy()
    expect(screen.getByText('Ingresa el lugar del evento.')).toBeTruthy()
    expect(
      screen.getByText('Ingresa un contacto para el evento.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía una sola vez los datos válidos, incluido typeId 0', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <EventForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    await user.type(
      screen.getByLabelText('Nombre del evento *'),
      validInput.name,
    )
    await user.click(
      screen.getByLabelText('Tipo de evento *'),
    )
    await user.click(
      await screen.findByRole('option', { name: eventType.name }),
    )
    await user.type(
      screen.getByLabelText('Fecha del evento *'),
      validInput.eventDate,
    )
    await user.type(
      screen.getByLabelText('Lugar *'),
      validInput.location,
    )
    await user.type(
      screen.getByLabelText('Contacto *'),
      validInput.contact,
    )
    await user.click(
      screen.getByRole('button', { name: 'Crear evento' }),
    )

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith(validInput, [])
  })

  it('rechaza una fecha de evento anterior al día actual', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <EventForm
        initialValues={{
          ...validInput,
          eventDate: '2000-01-01',
        }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Crear evento' }),
    )

    expect(
      screen.getByText('La fecha del evento no puede estar en el pasado.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('valida los campos, fechas y horas de una subtarea', async () => {
    const user = userEvent.setup()

    render(
      <EventForm
        initialValues={validInput}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    expect(screen.getByText('Ingresa el nombre de la tarea.')).toBeTruthy()
    expect(screen.getByText('Selecciona una fecha límite.')).toBeTruthy()
    expect(
      screen.getByText('Indica un tiempo estimado válido.'),
    ).toBeTruthy()

    await user.type(screen.getByLabelText('Nombre de la tarea *'), 'Decoración')
    await user.type(screen.getByLabelText('Fecha límite *'), '2000-01-01')
    await user.type(screen.getByLabelText('Tiempo estimado *'), '0')
    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    expect(
      screen.getByText('La fecha límite no puede estar en el pasado.'),
    ).toBeTruthy()
    expect(
      screen.getByText('Indica un tiempo estimado válido.'),
    ).toBeTruthy()

    await user.clear(screen.getByLabelText('Fecha límite *'))
    await user.type(screen.getByLabelText('Fecha límite *'), '2100-01-01')
    await user.clear(screen.getByLabelText('Tiempo estimado *'))
    await user.type(screen.getByLabelText('Tiempo estimado *'), '1.5')
    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    expect(
      screen.getByText(
        'La fecha límite debe ser anterior al 31/12/2099.',
      ),
    ).toBeTruthy()
  })

  it('agrega y envía una subtarea con los valores normalizados', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <EventForm
        initialValues={validInput}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    await user.type(
      screen.getByLabelText('Nombre de la tarea *'),
      '  Reservar decoración  ',
    )
    await user.type(screen.getByLabelText('Fecha límite *'), '2099-10-20')
    await user.type(screen.getByLabelText('Tiempo estimado *'), '2.5')
    await user.type(
      screen.getByLabelText('Nota opcional'),
      '  Confirmar colores  ',
    )
    await user.click(
      screen.getByRole('button', { name: 'Agregar tarea' }),
    )

    expect(screen.getByText('Reservar decoración')).toBeTruthy()
    expect(screen.getByText('Tareas agregadas (1)')).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Crear evento con tareas' }),
    )

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith(validInput, [
      {
        name: 'Reservar decoración',
        targetDate: '2099-10-20',
        estimatedHours: 2.5,
        details: 'Confirmar colores',
      },
    ])
  })

  it('edita, elimina y reinicia subtareas existentes', async () => {
    const user = userEvent.setup()

    render(
      <EventForm
        initialValues={validInput}
        initialSubtasks={initialSubtasks}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Cancelar tarea' }),
    )

    const firstTask = screen.getByText('Reservar salón').parentElement
    expect(firstTask).not.toBeNull()
    const [editFirstTask] = within(firstTask!).getAllByRole('button')
    await user.click(editFirstTask)

    expect(screen.getByText('Editar tarea')).toBeTruthy()
    expect(
      (screen.getByLabelText('Nombre de la tarea *') as HTMLInputElement).value,
    ).toBe('Reservar salón')

    await user.clear(screen.getByLabelText('Nombre de la tarea *'))
    await user.type(
      screen.getByLabelText('Nombre de la tarea *'),
      'Reservar finca',
    )
    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(screen.getByText('Reservar finca')).toBeTruthy()
    expect(screen.queryByText('Reservar salón')).toBeNull()

    const editedTask = screen.getByText('Reservar finca').parentElement
    const [editTask, deleteTask] = within(editedTask!).getAllByRole('button')
    await user.click(editTask)
    await user.click(deleteTask)

    expect(screen.getByText('Agregar nueva tarea')).toBeTruthy()
    expect(
      (screen.getByLabelText('Nombre de la tarea *') as HTMLInputElement).value,
    ).toBe('')
    expect(screen.getByText('Tareas agregadas (1)')).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Cancelar tarea' }),
    )
    const remainingTask = screen.getByText('Contratar música').parentElement
    const [, deleteRemainingTask] = within(remainingTask!).getAllByRole('button')
    await user.click(deleteRemainingTask)

    expect(screen.queryByText(/Tareas agregadas/)).toBeNull()

    await user.click(
      screen.getByRole('button', { name: '+ Agregar otra tarea' }),
    )
    expect(screen.getByText('Agregar nueva tarea')).toBeTruthy()
  })

  it('cancela la creación del evento y refleja el estado de envío', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    const { rerender } = render(
      <EventForm
        initialValues={validInput}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Cancelar creación' }),
    )
    expect(onCancel).toHaveBeenCalledOnce()

    rerender(
      <EventForm
        initialValues={validInput}
        onSubmit={vi.fn()}
        onCancel={onCancel}
        isSubmitting
      />,
    )

    expect(
      (screen.getByRole('button', {
        name: 'Guardando...',
      }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(
      (screen.getByLabelText('Nombre del evento *') as HTMLInputElement)
        .disabled,
    ).toBe(true)
  })
})
