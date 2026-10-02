import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '@clerk/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { createEvent } from '@/features/events/services/event.service'
import { createSubtask } from '@/features/events/services/subtasks.service'
import type {
  CreateEventInput,
  Event,
} from '@/features/events/types/event.types'
import type {
  CreateSubtaskInput,
} from '@/features/events/types/subtask.types'

const submittedInput: CreateEventInput = {
  name: 'Boda Backend',
  typeId: 0,
  eventDate: '2099-12-31',
  location: 'Cali',
  contact: 'Laura 3001234567',
}

const createEventDraftKey =
  'eventger:create-event-draft:user-test'

vi.mock('@/features/events/services/event.service', () => ({
  createEvent: vi.fn(),
}))

vi.mock('@/features/events/services/subtasks.service', () => ({
  createSubtask: vi.fn(),
}))

vi.mock('@/features/events/components/EventForm', () => ({
  EventForm: ({
    onSubmit,
    onCancel,
    onDraftChange,
    initialValues,
    initialSubtasks = [],
  }: {
    onSubmit: (
      data: CreateEventInput,
      subtasks: CreateSubtaskInput[],
    ) => Promise<void>
    onCancel: () => void
    onDraftChange?: (
      data: CreateEventInput,
      subtasks: CreateSubtaskInput[],
    ) => void
    initialValues?: CreateEventInput
    initialSubtasks?: CreateSubtaskInput[]
  }) => (
    <>
      <button
        type="button"
        onClick={() => onSubmit(submittedInput, [])}
      >
        Enviar formulario de prueba
      </button>
      <button type="button" onClick={() => onSubmit(submittedInput, initialSubtasks)}>
        Enviar con tareas de prueba
      </button>
      <button
        type="button"
        onClick={() =>
          onDraftChange?.(submittedInput, [])
        }
      >
        Guardar borrador de prueba
      </button>
      <button
        type="button"
        onClick={onCancel}
      >
        Cancelar
      </button>
      <span data-testid="initial-event-name">
        {initialValues?.name ?? ''}
      </span>
      <span data-testid="initial-subtask-count">
        {initialSubtasks.length}
      </span>
    </>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <CreateEventPage />
    </MemoryRouter>,
  )
}

describe('CreateEventPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true, userId: 'user-test', getToken: vi.fn().mockResolvedValue('test-token') } as never)
    sessionStorage.clear()
    vi.mocked(createEvent).mockReset()
    vi.mocked(createSubtask).mockReset()
  })

  it('muestra el estado de éxito con el nombre devuelto por el backend', async () => {
    const user = userEvent.setup()
    const createdEvent: Event = {
      id: 21,
      name: 'Boda Backend',
      typeId: 0,
      eventDate: '2099-12-31T00:00:00.000Z',
      location: 'Cali',
      contact: submittedInput.contact,
    }
    vi.mocked(createEvent).mockResolvedValue(createdEvent)

    sessionStorage.setItem(
      createEventDraftKey,
      JSON.stringify({
        version: 1,
        data: submittedInput,
        subtasks: [],
      }),
    )

    renderPage()

    await user.click(
      screen.getByRole('button', {
        name: 'Enviar formulario de prueba',
      }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Evento creado' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'Boda Backend se creó correctamente',
      }),
    ).toBeTruthy()
    expect(createEvent).toHaveBeenCalledOnce()
    expect(createEvent).toHaveBeenCalledWith(
      submittedInput,
      expect.any(Function),
    )
    expect(
      screen.getByRole('button', { name: 'Volver a eventos' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Ver detalle del evento' }),
    ).toBeTruthy()
    expect(
      sessionStorage.getItem(
        createEventDraftKey,
      ),
    ).toBeNull()
  })

  it('muestra el estado de error cuando la creación falla', async () => {
    const user = userEvent.setup()
    vi.mocked(createEvent).mockRejectedValue(
      new Error('No se pudo crear el evento'),
    )

    renderPage()

    await user.click(
      screen.getByRole('button', {
        name: 'Enviar formulario de prueba',
      }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Evento no creado' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'No pudimos crear Boda Backend',
      }),
    ).toBeTruthy()
    expect(createEvent).toHaveBeenCalledOnce()
  })

  it('cierra la creación y vuelve a eventos', async () => {
    const user = userEvent.setup()

    sessionStorage.setItem(
      createEventDraftKey,
      JSON.stringify({
        version: 1,
        data: submittedInput,
        subtasks: [],
      }),
    )

    render(
      <MemoryRouter initialEntries={['/crear']}>
        <Routes>
          <Route
            path="/crear"
            element={<CreateEventPage />}
          />
          <Route
            path="/eventos"
            element={<h1>Eventos destino</h1>}
          />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Cancelar',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Eventos destino',
      }),
    ).toBeTruthy()
    expect(
      sessionStorage.getItem(
        createEventDraftKey,
      ),
    ).toBeNull()
  })

  it('restaura el borrador al volver a crear', () => {
    const savedSubtask: CreateSubtaskInput = {
      name: 'Confirmar catering',
      targetDate: '2099-12-20',
      estimatedHours: 2,
      details: '',
    }

    sessionStorage.setItem(
      createEventDraftKey,
      JSON.stringify({
        version: 1,
        data: submittedInput,
        subtasks: [savedSubtask],
      }),
    )

    renderPage()

    expect(
      screen.getByTestId(
        'initial-event-name',
      ).textContent,
    ).toBe(submittedInput.name)
    expect(
      screen.getByTestId(
        'initial-subtask-count',
      ).textContent,
    ).toBe('1')
  })

  it('guarda los cambios del borrador durante la sesión', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(
      screen.getByRole('button', {
        name: 'Guardar borrador de prueba',
      }),
    )

    expect(
      JSON.parse(
        sessionStorage.getItem(
          createEventDraftKey,
        ) ?? '{}',
      ),
    ).toEqual({
      version: 1,
      data: submittedInput,
      subtasks: [],
    })
  })

  it('reanuda solo las tareas pendientes después de un fallo y una recarga, sin crear otro evento', async () => {
    const user = userEvent.setup()
    const tasks = ['Primera', 'Segunda', 'Tercera'].map(name => ({ name, targetDate: '2099-12-20', estimatedHours: 2, details: '' }))
    sessionStorage.setItem(createEventDraftKey, JSON.stringify({ version: 1, data: submittedInput, subtasks: tasks }))
    vi.mocked(createEvent).mockResolvedValue({ ...submittedInput, typeId: 0, id: 21 })
    vi.mocked(createSubtask).mockResolvedValue({} as never)
    vi.mocked(createSubtask).mockResolvedValueOnce({} as never).mockRejectedValueOnce(new Error('No se guardó la segunda'))
    const mounted = renderPage()
    await user.click(screen.getByRole('button', { name: 'Enviar con tareas de prueba' }))
    expect(await screen.findByRole('heading', { name: 'Evento creado con tareas pendientes' })).toBeTruthy()
    expect(createEvent).toHaveBeenCalledOnce()
    expect(createSubtask).toHaveBeenCalledTimes(2)
    expect(JSON.parse(sessionStorage.getItem(createEventDraftKey) ?? '{}').subtasks).toEqual(tasks.slice(1))
    mounted.unmount()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Reintentar tareas' }))
    expect(await screen.findByRole('heading', { name: 'Evento creado' })).toBeTruthy()
    expect(createEvent).toHaveBeenCalledOnce()
    expect(createSubtask).toHaveBeenCalledTimes(4)
    expect(createSubtask).toHaveBeenNthCalledWith(3, 21, tasks[1], expect.any(Function))
    expect(createSubtask).toHaveBeenNthCalledWith(4, 21, tasks[2], expect.any(Function))
    expect(sessionStorage.getItem(createEventDraftKey)).toBeNull()
  })

  it('no muestra el borrador de una cuenta al cambiar a otra sin desmontar la ruta', () => {
    sessionStorage.setItem(createEventDraftKey, JSON.stringify({ version: 1, data: submittedInput, subtasks: [] }))
    const { rerender } = renderPage()
    expect(screen.getByTestId('initial-event-name').textContent).toBe(submittedInput.name)
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true, userId: 'other-user', getToken: vi.fn() } as never)
    rerender(<MemoryRouter><CreateEventPage /></MemoryRouter>)
    expect(screen.getByTestId('initial-event-name').textContent).toBe('')
  })

  it('descarta un borrador con JSON válido pero campos incompatibles', () => {
    sessionStorage.setItem(createEventDraftKey, JSON.stringify({ version: 1, data: {}, subtasks: [] }))
    renderPage()
    expect(screen.getByTestId('initial-event-name').textContent).toBe('')
    expect(sessionStorage.getItem(createEventDraftKey)).toBeNull()
  })
})
