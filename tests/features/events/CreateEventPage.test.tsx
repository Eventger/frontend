import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  'eventger:create-event-draft'

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
      data: submittedInput,
      subtasks: [],
    })
  })
})
