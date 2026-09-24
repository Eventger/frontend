import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { createEvent } from '@/features/events/services/event.service'
import type {
  CreateEventInput,
  Event,
} from '@/features/events/types/event.types'

const submittedInput: CreateEventInput = {
  name: 'Boda Backend',
  typeId: 0,
  eventDate: '2099-12-31',
  location: 'Cali',
}

vi.mock('@/features/events/services/event.service', () => ({
  createEvent: vi.fn(),
}))

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock('@/features/events/components/EventForm', () => ({
  EventForm: ({
    onSubmit,
  }: {
    onSubmit: (data: CreateEventInput) => Promise<void>
  }) => (
    <button
      type="button"
      onClick={() => onSubmit(submittedInput)}
    >
      Enviar formulario de prueba
    </button>
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
    vi.mocked(createEvent).mockReset()
  })

  it('muestra el estado de éxito con el nombre devuelto por el backend', async () => {
    const user = userEvent.setup()
    const createdEvent: Event = {
      id: 21,
      name: 'Boda Backend',
      typeId: 0,
      eventDate: '2099-12-31T00:00:00.000Z',
      location: 'Cali',
    }
    vi.mocked(createEvent).mockResolvedValue(createdEvent)

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
    expect(createEvent).toHaveBeenCalledWith(submittedInput)
    expect(
      screen.getByRole('button', { name: 'Volver a eventos' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Ver detalle del evento' }),
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
})
