import { ApiError } from '@/lib/api'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useEventDetail } from '@/features/events/hooks/useEventDetail'
import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import { useEventTypes } from '@/features/events/hooks/useEventTypes'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import {
  deleteEvent,
  updateEvent,
} from '@/features/events/services/event.service'
import {
  createSubtask,
  deleteSubtask,
  updateSubtask,
} from '@/features/events/services/subtasks.service'
import type { Event } from '@/features/events/types/event.types'
import type { Subtask } from '@/features/events/types/subtask.types'
import {
  createSubtaskInputFixture,
  eventFixture,
  subtaskFixture,
} from './subtask.fixtures'

// Mocks globales
vi.mock('@/features/events/hooks/useEventDetail', () => ({
  useEventDetail: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventSubtasks', () => ({
  useEventSubtasks: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventTypes', () => ({
  useEventTypes: vi.fn(),
}))

vi.mock('@/features/events/services/event.service', () => ({
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))

vi.mock('@/features/events/services/subtasks.service', () => ({
  createSubtask: vi.fn(),
  updateSubtask: vi.fn(),
  deleteSubtask: vi.fn(),
}))

vi.mock('@/features/events/components/detail/RegisterProgressDialog', () => ({
  RegisterProgressDialog: ({
    onSaved,
    onClose,
  }: {
    onSaved: (task: Subtask) => void
    onClose: () => void
  }) => (
    <div data-testid="mock-register-dialog">
      <button
        type="button"
        onClick={() => {
          onSaved({
            id: 1,
            eventId: 1,
            name: 'Tarea Test',
            targetDate: '2026-10-15',
            estimatedHours: 2,
            details: '',
            state: 'completed',
          })
          onClose()
        }}
      >
        Simular Guardar Avance
      </button>
    </div>
  ),
}))

vi.mock('@/features/events/components/detail/RescheduleTaskDialog', () => ({
  RescheduleTaskDialog: () => <div data-testid="mock-reschedule-dialog" />,
}))

const retryEvent = vi.fn().mockResolvedValue(undefined)
const retryEventTypes = vi.fn().mockResolvedValue(undefined)
const refreshSubtasks = vi.fn().mockResolvedValue(undefined)

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/evento/${eventFixture.id}`]}>
      <LocationProbe />
      <Routes>
        <Route path="/evento/:id" element={<EventDetailPage />} />
        <Route path="/eventos" element={<h1>Listado de eventos</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function openAndSubmitForm() {
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

  const dialog = await screen.findByRole('dialog')
  await user.type(
    within(dialog).getByLabelText('Nombre de la tarea *'),
    createSubtaskInputFixture.name,
  )
  await user.type(
    within(dialog).getByLabelText('Fecha límite *'),
    createSubtaskInputFixture.targetDate,
  )
  await user.type(
    within(dialog).getByLabelText('Tiempo estimado *'),
    String(createSubtaskInputFixture.estimatedHours),
  )
  await user.type(
    within(dialog).getByLabelText('Nota (opcional)'),
    createSubtaskInputFixture.details,
  )
  await user.click(
    within(dialog).getByRole('button', { name: 'Agregar tarea' }),
  )

  return user
}

function showSubtasks() {
  vi.mocked(useEventSubtasks).mockReturnValue({
    subtasks: [subtaskFixture],
    isLoading: false,
    error: null,
    refresh: refreshSubtasks,
  })
}

function getTaskCard() {
  const card = screen
    .getByRole('heading', { name: subtaskFixture.name })
    .closest('article')

  if (!card) {
    throw new Error('No se encontró la tarjeta de la subtarea')
  }

  return within(card)
}

async function submitEventEdit(name: string, contact: string) {
  const user = userEvent.setup()

  await user.click(
    screen.getByRole('button', { name: 'Editar evento' }),
  )

  const nameInput = screen.getByLabelText('Nombre del evento *')
  const contactInput = screen.getByLabelText('Contacto *')

  await user.clear(nameInput)
  await user.type(nameInput, name)
  await user.clear(contactInput)
  await user.type(contactInput, contact)
  await user.click(
    screen.getByRole('button', { name: 'Guardar cambios' }),
  )

  return user
}

describe('EventDetailPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'))

    vi.mocked(createSubtask).mockReset()
    vi.mocked(updateSubtask).mockReset()
    vi.mocked(deleteSubtask).mockReset()
    vi.mocked(updateEvent).mockReset()
    vi.mocked(deleteEvent).mockReset()
    vi.mocked(useEventDetail).mockReset()
    vi.mocked(useEventSubtasks).mockReset()
    vi.mocked(useEventTypes).mockReset()
    retryEvent.mockClear()
    retryEventTypes.mockClear()
    refreshSubtasks.mockClear()

    vi.mocked(useEventTypes).mockReturnValue({
      eventTypes: [
        {
          id: eventFixture.typeId,
          name: 'Boda',
          description: 'Evento de boda.',
        },
      ],
      isLoading: false,
      error: null,
      retry: retryEventTypes,
    })
    vi.mocked(useEventDetail).mockReturnValue({
      event: eventFixture,
      isLoading: false,
      error: null,
      retry: retryEvent,
    })
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: null,
      refresh: refreshSubtasks,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el estado de carga', () => {
    vi.mocked(useEventDetail).mockReturnValue({
      event: null,
      isLoading: true,
      error: null,
      retry: retryEvent,
    })

    renderPage()

    expect(
      screen.getByRole('status', {
        name: 'Cargando evento',
      }),
    ).toBeTruthy()
  })

  it('muestra el estado de error', () => {
    vi.mocked(useEventDetail).mockReturnValue({
      event: null,
      isLoading: false,
      error: 'No se pudo cargar el evento',
      retry: retryEvent,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'No pudimos cargar el evento' }),
    ).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('muestra el estado de evento inexistente', () => {
    vi.mocked(useEventDetail).mockReturnValue({
      event: null,
      isLoading: false,
      error: null,
      retry: retryEvent,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Evento no encontrado' }),
    ).toBeTruthy()
  })

  it('el estado inexistente no queda oculto por un error anterior de subtareas', () => {
    vi.mocked(useEventDetail).mockReturnValue({
      event: null,
      isLoading: false,
      error: null,
      retry: retryEvent,
    })
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: 'Error anterior de subtareas',
      refresh: refreshSubtasks,
    })

    renderPage()

    expect(screen.getByRole('heading', { name: 'Evento no encontrado' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'No pudimos cargar el evento' })).toBeNull()
  })

  it('muestra el detalle y el estado vacío de subtareas', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: eventFixture.name }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'Aún no tienes tareas para este evento',
      }),
    ).toBeTruthy()
  })

  it('abre el formulario al agregar una tarea', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(
      await screen.findByRole('heading', { name: 'Agregar tarea' }),
    ).toBeTruthy()
  })

  it('vuelve al detalle desde la miga de pan sin guardar el borrador de edición', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Editar evento' }))
    await user.clear(screen.getByLabelText('Contacto *'))
    await user.type(screen.getByLabelText('Contacto *'), 'Borrador sin enviar')

    const breadcrumbs = within(screen.getByRole('navigation', { name: 'Miga de pan' }))
    expect(breadcrumbs.getByText('Editar evento').getAttribute('aria-current')).toBe('page')
    await user.click(breadcrumbs.getByRole('link', { name: eventFixture.name }))

    expect(screen.getByRole('heading', { name: eventFixture.name })).toBeTruthy()
    expect(updateEvent).not.toHaveBeenCalled()
    expect(retryEvent).toHaveBeenCalledOnce()
    expect(breadcrumbs.queryByRole('link', { name: eventFixture.name })).toBeNull()
    expect(breadcrumbs.getByText(eventFixture.name).getAttribute('aria-current')).toBe('page')
  })

  it('edita el evento y muestra la confirmación con los datos actualizados', async () => {
    const user = userEvent.setup()
    const updatedEvent = {
      ...eventFixture,
      name: 'Boda actualizada',
      contact: 'Daniel 3109876543',
    }
    vi.mocked(updateEvent).mockResolvedValue(updatedEvent)
    renderPage()

    await user.click(
      screen.getByRole('button', { name: 'Editar evento' }),
    )

    expect(screen.getByTestId('location').textContent).toBe(
      `/evento/${eventFixture.id}`,
    )

    const nameInput = screen.getByLabelText('Nombre del evento *')
    await user.clear(nameInput)
    await user.type(nameInput, updatedEvent.name)
    const contactInput = screen.getByLabelText('Contacto *')
    expect((contactInput as HTMLInputElement).value).toBe(
      eventFixture.contact,
    )
    await user.clear(contactInput)
    await user.type(contactInput, updatedEvent.contact)
    await user.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(updateEvent).toHaveBeenCalledOnce()
    expect(updateEvent).toHaveBeenCalledWith(eventFixture.id, {
      name: updatedEvent.name,
      typeId: eventFixture.typeId,
      eventDate: '2026-10-24',
      location: eventFixture.location,
      contact: updatedEvent.contact,
    }, expect.any(Function))
    expect(
      await screen.findByRole('heading', { name: 'Evento actualizado' }),
    ).toBeTruthy()
    expect(screen.getByText(`La información y las tareas de ${updatedEvent.name} se actualizaron correctamente.`)).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(
      screen.getByRole('heading', { name: updatedEvent.name }),
    ).toBeTruthy()
    expect(retryEvent).toHaveBeenCalledOnce()
  })

  it('permite seguir editando con los datos actualizados', async () => {
    const updatedEvent = {
      ...eventFixture,
      name: 'Boda actualizada',
      contact: 'Daniel 3109876543',
    }
    vi.mocked(updateEvent).mockResolvedValue(updatedEvent)
    renderPage()

    const user = await submitEventEdit(
      updatedEvent.name,
      updatedEvent.contact,
    )

    await screen.findByRole('heading', { name: 'Evento actualizado' })
    await user.click(
      screen.getByRole('button', { name: 'Volver a editar' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Editar evento' }),
    ).toBeTruthy()
    expect(
      (screen.getByLabelText('Nombre del evento *') as HTMLInputElement).value,
    ).toBe(updatedEvent.name)
    expect(
      (screen.getByLabelText('Contacto *') as HTMLInputElement).value,
    ).toBe(updatedEvent.contact)
  })

  it('muestra el error de edición y reintenta con los mismos datos', async () => {
    const editedName = 'Boda con error'
    const editedContact = 'Laura 3150000000'
    vi.mocked(updateEvent).mockRejectedValue(
      new Error('No se pudo actualizar'),
    )
    renderPage()

    const user = await submitEventEdit(editedName, editedContact)

    expect(
      await screen.findByRole('heading', { name: 'Cambios no guardados' }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )

    const expectedInput = {
      name: editedName,
      typeId: eventFixture.typeId,
      eventDate: '2026-10-24',
      location: eventFixture.location,
      contact: editedContact,
    }
    expect(updateEvent).toHaveBeenCalledTimes(2)
    expect(updateEvent).toHaveBeenNthCalledWith(
      1,
      eventFixture.id,
      expectedInput,
      expect.any(Function),
    )
    expect(updateEvent).toHaveBeenNthCalledWith(
      2,
      eventFixture.id,
      expectedInput,
      expect.any(Function),
    )
  })

  it('conserva los campos al volver a revisar un error y permite corregirlos', async () => {
    vi.mocked(updateEvent)
      .mockRejectedValueOnce(new Error('Datos rechazados'))
      .mockResolvedValueOnce({ ...eventFixture, name: 'Nombre corregido', contact: 'Contacto conservado' })
    renderPage()

    const user = await submitEventEdit('Nombre conservado', 'Contacto conservado')
    await screen.findByRole('heading', { name: 'Cambios no guardados' })
    await user.click(screen.getByRole('button', { name: 'Volver y revisar' }))

    const nameInput = screen.getByLabelText('Nombre del evento *') as HTMLInputElement
    expect(nameInput.value).toBe('Nombre conservado')
    expect((screen.getByLabelText('Contacto *') as HTMLInputElement).value).toBe('Contacto conservado')

    await user.clear(nameInput)
    await user.type(nameInput, 'Nombre corregido')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await screen.findByRole('heading', { name: 'Evento actualizado' })
    expect(updateEvent).toHaveBeenLastCalledWith(eventFixture.id, {
      name: 'Nombre corregido',
      contact: 'Contacto conservado',
      typeId: eventFixture.typeId,
      eventDate: '2026-10-24',
      location: eventFixture.location,
    }, expect.any(Function))
  })

  it('cancela o confirma la eliminación del evento y navega al listado', async () => {
    const user = userEvent.setup()
    vi.mocked(deleteEvent).mockResolvedValue(undefined)
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    let dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByRole('heading', { name: '¿Eliminar evento?' }),
    ).toBeTruthy()
    expect(deleteEvent).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(deleteEvent).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    dialog = await screen.findByRole('alertdialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar evento' }),
    )

    expect(deleteEvent).toHaveBeenCalledOnce()
    expect(deleteEvent).toHaveBeenCalledWith(
      eventFixture.id,
      expect.any(Function),
    )
    expect(
      await screen.findByRole('heading', { name: 'Evento eliminado' }),
    ).toBeTruthy()
    const breadcrumbs = within(screen.getByRole('navigation', { name: 'Miga de pan' }))
    expect(breadcrumbs.queryByRole('link', { name: eventFixture.name })).toBeNull()
    expect(breadcrumbs.getByRole('link', { name: 'Eventos' }).getAttribute('href')).toBe('/eventos')

    await user.click(
      screen.getByRole('button', { name: 'Volver a eventos' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Listado de eventos' }),
    ).toBeTruthy()
    expect(screen.getByTestId('location').textContent).toBe('/eventos')
  })

  it('muestra el error al eliminar evento y permite reintentar', async () => {
    const user = userEvent.setup()
    vi.mocked(deleteEvent).mockRejectedValue(
      new Error('No se pudo eliminar'),
    )
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar evento' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'No se pudo eliminar' }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )

    expect(deleteEvent).toHaveBeenCalledTimes(2)
    expect(deleteEvent).toHaveBeenNthCalledWith(
      1,
      eventFixture.id,
      expect.any(Function),
    )
    expect(deleteEvent).toHaveBeenNthCalledWith(
      2,
      eventFixture.id,
      expect.any(Function),
    )
  })

  it('mantiene la gestión de subtareas fuera de las tarjetas del detalle', () => {
    showSubtasks()
    renderPage()

    expect(
      screen.getByText(
        'Las tareas se gestionan desde Editar evento.',
      ),
    ).toBeTruthy()
    expect(
      getTaskCard().queryByRole('button', {
        name: 'Editar',
      }),
    ).toBeNull()
    expect(
      getTaskCard().queryByRole('button', {
        name: 'Eliminar',
      }),
    ).toBeNull()
  })

  it('crea una subtarea, refresca y permite volver al evento', async () => {
    vi.mocked(createSubtask).mockResolvedValue(subtaskFixture)
    renderPage()

    const user = await openAndSubmitForm()

    expect(
      await screen.findByRole('heading', { name: 'Tarea agregada' }),
    ).toBeTruthy()
    expect(createSubtask).toHaveBeenCalledWith(
      eventFixture.id,
      createSubtaskInputFixture,
      expect.any(Function),
    )
    expect(refreshSubtasks).toHaveBeenCalledOnce()

    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(
      screen.getByRole('heading', { name: eventFixture.name }),
    ).toBeTruthy()
    expect(refreshSubtasks).toHaveBeenCalledTimes(2)
  })

  it('permite abrir un formulario limpio para agregar otra tarea', async () => {
    vi.mocked(createSubtask).mockResolvedValue(subtaskFixture)
    renderPage()

    const user = await openAndSubmitForm()
    await screen.findByRole('heading', { name: 'Tarea agregada' })

    await user.click(
      screen.getByRole('button', { name: 'Agregar otra tarea' }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Agregar tarea' }),
    ).toBeTruthy()
    expect(
      (within(dialog).getByLabelText('Nombre de la tarea *') as HTMLInputElement)
        .value,
    ).toBe('')
  })

  it('muestra el error y reintenta con los mismos datos', async () => {
    vi.mocked(createSubtask).mockRejectedValue(
      new Error('No se pudo crear la subtarea'),
    )
    renderPage()

    const user = await openAndSubmitForm()

    expect(
      await screen.findByRole('heading', { name: 'Tarea no agregada' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: `No pudimos agregar ${createSubtaskInputFixture.name}`,
      }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )

    expect(createSubtask).toHaveBeenCalledTimes(2)
    expect(createSubtask).toHaveBeenNthCalledWith(
      1,
      eventFixture.id,
      createSubtaskInputFixture,
      expect.any(Function),
    )
    expect(createSubtask).toHaveBeenNthCalledWith(
      2,
      eventFixture.id,
      createSubtaskInputFixture,
      expect.any(Function),
    )
  })

  it('muestra la validación de fecha junto al campo sin perder el borrador y permite corregirla', async () => {
    const message = 'La fecha del evento no puede ser anterior a la fecha límite de sus tareas. Reprograma primero estas tareas: Catering.'
    vi.mocked(updateEvent).mockRejectedValueOnce(new ApiError(400, { success: false, errors: { date: [message] } }))
    renderPage()
    const user = await submitEventEdit('Nombre conservado', 'Contacto conservado')
    await screen.findByText(message)
    expect((screen.getByLabelText('Nombre del evento *') as HTMLInputElement).value).toBe('Nombre conservado')
    expect((screen.getByLabelText('Contacto *') as HTMLInputElement).value).toBe('Contacto conservado')
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Fecha del evento *')))
    expect(screen.queryByRole('heading', { name: 'Cambios no guardados' })).toBeNull()
    vi.mocked(updateEvent).mockResolvedValue({ ...eventFixture, name: 'Nombre conservado', contact: 'Contacto conservado' })
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(updateEvent).toHaveBeenCalledTimes(2)
    expect(updateEvent).toHaveBeenLastCalledWith(eventFixture.id, expect.objectContaining({ name: 'Nombre conservado', contact: 'Contacto conservado' }), expect.any(Function))
  })

  it('vuelve al formulario con el mensaje de fecha si un reintento tras error de red recibe una validación', async () => {
    const message = 'Reprograma primero estas tareas: Catering.'
    vi.mocked(updateEvent)
      .mockRejectedValueOnce(new Error('network'))
      .mockRejectedValueOnce(new ApiError(400, { errors: { date: [message] } }))
    renderPage()
    const user = await submitEventEdit('Borrador conservado', 'Contacto conservado')
    await screen.findByRole('heading', { name: 'Cambios no guardados' })
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    await screen.findByText(message)
    expect((screen.getByLabelText('Nombre del evento *') as HTMLInputElement).value).toBe('Borrador conservado')
    expect((screen.getByLabelText('Contacto *') as HTMLInputElement).value).toBe('Contacto conservado')
  })
})

describe('EventDetailContent', () => {
  const mockEvent = {
    name: 'Evento de Prueba',
    eventDate: '2026-10-20',
    location: 'Auditorio Central',
    contact: 'contacto@test.com',
  } as Event

  const mockSubtasks: Subtask[] = [
    {
      id: 1,
      eventId: 1,
      name: 'Tarea Test',
      targetDate: '2026-10-15',
      estimatedHours: 2,
      details: 'Nota de prueba',
      state: 'in_progress',
    },
  ]

  const defaultProps = {
    event: mockEvent,
    subtasks: mockSubtasks,
    onAddTask: vi.fn(),
    onEditEvent: vi.fn(),
    onSubtaskUpdated: vi.fn(),
  }

  it('debe actualizar el estado visual al registrar avance', async () => {
    const user = userEvent.setup()
    render(<EventDetailContent {...defaultProps} />)

    expect(screen.getByText('En progreso')).toBeDefined()

    const actionsButton = screen.getByRole('button', {
      name: /Más acciones para Tarea Test/i,
    })
    await user.click(actionsButton)

    const registerOption = screen.getByRole('menuitem', { name: /Registrar avance/i })
    await user.click(registerOption)

    expect(screen.getByTestId('mock-register-dialog')).toBeDefined()

    const saveButton = screen.getByRole('button', { name: /Simular Guardar Avance/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Completada')).toBeDefined()
    })

    expect(defaultProps.onSubtaskUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        state: 'completed',
      })
    )
  })

  it('debe abrir y permitir interactuar con el diálogo de reprogramar', async () => {
    const user = userEvent.setup()
    render(<EventDetailContent {...defaultProps} />)

    const actionsButton = screen.getByRole('button', {
      name: /Más acciones para Tarea Test/i,
    })
    await user.click(actionsButton)

    const rescheduleOption = screen.getByRole('menuitem', { name: /Reprogramar/i })
    await user.click(rescheduleOption)

    expect(screen.getByTestId('mock-reschedule-dialog')).toBeDefined()
  })

  it('debe manejar correctamente el caso cuando no se pasa onSubtaskUpdated', async () => {
    const user = userEvent.setup()
    const propsWithoutCallback = { ...defaultProps, onSubtaskUpdated: undefined }

    render(<EventDetailContent {...propsWithoutCallback} />)

    const actionsButton = screen.getByRole('button', {
      name: /Más acciones para Tarea Test/i,
    })
    await user.click(actionsButton)

    const registerOption = screen.getByRole('menuitem', { name: /Registrar avance/i })
    await user.click(registerOption)

    const saveButton = screen.getByRole('button', { name: /Simular Guardar Avance/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Completada')).toBeDefined()
    })
  })

  it('debe actualizar las subtareas si cambian las props externas', async () => {
    const { rerender } = render(<EventDetailContent {...defaultProps} />)

    expect(screen.getByText('En progreso')).toBeDefined()

    const updatedSubtasks: Subtask[] = [
      {
        ...mockSubtasks[0],
        state: 'completed',
      },
    ]

    rerender(<EventDetailContent {...defaultProps} subtasks={updatedSubtasks} />)

    expect(screen.getByText('Completada')).toBeDefined()
  })
})

import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'

describe('EventTaskCard - Cobertura de interacciones', () => {
  const mockSubtaskWithNote: Subtask = {
    id: 99,
    eventId: 1,
    name: 'Subtarea con nota',
    targetDate: '2026-10-15',
    estimatedHours: 4,
    details: 'Esta es una nota explicativa de la tarea',
    state: 'in_progress',
  }

  it('debe abrir y cerrar la nota de la tarea al presionar el botón de nota', async () => {
    const user = userEvent.setup()
    render(<EventTaskCard subtask={mockSubtaskWithNote} />)

    // 1. Selecciona exactamente el botón "Nota"
    const noteButton = screen.getByRole('button', { name: /^Nota$/i })
    await user.click(noteButton)
    expect(screen.getByText('Esta es una nota explicativa de la tarea')).toBeDefined()

    // 2. Oculta la nota
    const hideNoteButton = screen.getByRole('button', { name: /Ocultar/i })
    await user.click(hideNoteButton)
    expect(screen.queryByText('Esta es una nota explicativa de la tarea')).toBeNull()
  })

  it('debe desplegar el menú de acciones con posicionamiento y permitir ver/ocultar detalles', async () => {
    const user = userEvent.setup()
    render(<EventTaskCard subtask={mockSubtaskWithNote} />)

    // Abre el menú flotante calculando coordenadas
    const moreButton = screen.getByRole('button', { name: /Más acciones para Subtarea con nota/i })
    await user.click(moreButton)

    // Opción Ver detalles
    const detailsOption = screen.getByRole('menuitem', { name: /Ver detalles/i })
    await user.click(detailsOption)

    expect(screen.getByText('Detalles de la tarea')).toBeDefined()

    // Volver a abrir menú para presionar Ocultar detalles
    await user.click(moreButton)
    const hideDetailsOption = screen.getByRole('menuitem', { name: /Ocultar detalles/i })
    await user.click(hideDetailsOption)
  })

  it('debe cerrar el menú de acciones haciendo clic en el backdrop invisible', async () => {
    const user = userEvent.setup()
    render(<EventTaskCard subtask={mockSubtaskWithNote} />)

    const moreButton = screen.getByRole('button', { name: /Más acciones para Subtarea con nota/i })
    await user.click(moreButton)

    const backdrop = screen.getByRole('button', { name: /Cerrar menú de acciones/i })
    await user.click(backdrop)

    expect(screen.queryByRole('menuitem', { name: /Registrar avance/i })).toBeNull()
  })
})