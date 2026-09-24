import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
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
import {
  deleteEvent,
  updateEvent,
} from '@/features/events/services/event.service'
import {
  createSubtask,
  deleteSubtask,
  updateSubtask,
} from '@/features/events/services/subtasks.service'
import {
  createSubtaskInputFixture,
  eventFixture,
  subtaskFixture,
} from './subtask.fixtures'

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}))

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
        <Route
          path="/eventos"
          element={<h1>Listado de eventos</h1>}
        />
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

    expect(screen.getByLabelText('Cargando evento')).toBeTruthy()
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
    })
    expect(
      await screen.findByRole('heading', { name: 'Evento actualizado' }),
    ).toBeTruthy()
    expect(screen.getByText(/Boda actualizada/)).toBeTruthy()

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
      screen.getByRole('button', { name: 'Seguir editando' }),
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
    )
    expect(updateEvent).toHaveBeenNthCalledWith(
      2,
      eventFixture.id,
      expectedInput,
    )
  })

  it('cancela o confirma la eliminación del evento y navega al listado', async () => {
    const user = userEvent.setup()
    vi.mocked(deleteEvent).mockResolvedValue(undefined)
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    let dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: '¿Eliminar evento?' }),
    ).toBeTruthy()
    expect(deleteEvent).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(deleteEvent).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar evento' }),
    )

    expect(deleteEvent).toHaveBeenCalledOnce()
    expect(deleteEvent).toHaveBeenCalledWith(eventFixture.id)
    expect(
      await screen.findByRole('heading', { name: 'Evento eliminado' }),
    ).toBeTruthy()

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
    const dialog = await screen.findByRole('dialog')
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
    expect(deleteEvent).toHaveBeenNthCalledWith(1, eventFixture.id)
    expect(deleteEvent).toHaveBeenNthCalledWith(2, eventFixture.id)
  })

  it('edita una subtarea y muestra el feedback de éxito', async () => {
    const user = userEvent.setup()
    const updatedSubtask = {
      ...subtaskFixture,
      name: 'Coordinar transporte actualizado',
    }
    showSubtasks()
    vi.mocked(updateSubtask).mockResolvedValue(updatedSubtask)
    renderPage()

    await user.click(getTaskCard().getByRole('button', { name: 'Editar' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Editar tarea' }),
    ).toBeTruthy()
    const nameInput = within(dialog).getByLabelText('Nombre de la tarea *')
    await user.clear(nameInput)
    await user.type(nameInput, updatedSubtask.name)
    await user.click(
      within(dialog).getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(updateSubtask).toHaveBeenCalledOnce()
    expect(updateSubtask).toHaveBeenCalledWith(subtaskFixture.id, {
      name: updatedSubtask.name,
      targetDate: subtaskFixture.targetDate,
      estimatedHours: subtaskFixture.estimatedHours,
      details: subtaskFixture.details,
    })
    expect(
      await screen.findByRole('heading', { name: 'Tarea actualizada' }),
    ).toBeTruthy()
    expect(refreshSubtasks).toHaveBeenCalledOnce()
  })

  it('muestra el error de edición de subtarea y reintenta los mismos datos', async () => {
    const user = userEvent.setup()
    showSubtasks()
    vi.mocked(updateSubtask).mockRejectedValue(
      new Error('No se pudo actualizar'),
    )
    renderPage()

    await user.click(getTaskCard().getByRole('button', { name: 'Editar' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Guardar cambios' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Cambios no guardados' }),
    ).toBeTruthy()
    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )

    expect(updateSubtask).toHaveBeenCalledTimes(2)
    expect(updateSubtask).toHaveBeenNthCalledWith(
      1,
      subtaskFixture.id,
      createSubtaskInputFixture,
    )
    expect(updateSubtask).toHaveBeenNthCalledWith(
      2,
      subtaskFixture.id,
      createSubtaskInputFixture,
    )
  })

  it('cancela o confirma la eliminación de una subtarea', async () => {
    const user = userEvent.setup()
    showSubtasks()
    vi.mocked(deleteSubtask).mockResolvedValue(undefined)
    renderPage()

    await user.click(getTaskCard().getByRole('button', { name: 'Eliminar' }))
    let dialog = await screen.findByRole('dialog')
    expect(deleteSubtask).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(deleteSubtask).not.toHaveBeenCalled()

    await user.click(getTaskCard().getByRole('button', { name: 'Eliminar' }))
    dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar tarea' }),
    )

    expect(deleteSubtask).toHaveBeenCalledOnce()
    expect(deleteSubtask).toHaveBeenCalledWith(subtaskFixture.id)
    expect(
      await screen.findByRole('heading', { name: 'Tarea eliminada' }),
    ).toBeTruthy()
    expect(refreshSubtasks).toHaveBeenCalledOnce()
  })

  it('muestra el error al eliminar subtarea y reintenta el DELETE', async () => {
    const user = userEvent.setup()
    showSubtasks()
    vi.mocked(deleteSubtask).mockRejectedValue(
      new Error('No se pudo eliminar'),
    )
    renderPage()

    await user.click(getTaskCard().getByRole('button', { name: 'Eliminar' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar tarea' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Tarea no eliminada' }),
    ).toBeTruthy()
    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )

    expect(deleteSubtask).toHaveBeenCalledTimes(2)
    expect(deleteSubtask).toHaveBeenNthCalledWith(1, subtaskFixture.id)
    expect(deleteSubtask).toHaveBeenNthCalledWith(2, subtaskFixture.id)
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
    )
    expect(createSubtask).toHaveBeenNthCalledWith(
      2,
      eventFixture.id,
      createSubtaskInputFixture,
    )
  })
})
