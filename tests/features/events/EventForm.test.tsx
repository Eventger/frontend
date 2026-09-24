import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventForm } from '@/features/events/components/EventForm'
import { useEventTypes } from '@/features/events/hooks/useEventTypes'
import type { CreateEventInput } from '@/features/events/types/event.types'

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
}

describe('EventForm', () => {
  beforeEach(() => {
    vi.mocked(useEventTypes).mockReturnValue({
      eventTypes: [eventType],
      isLoading: false,
      error: null,
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
    expect(screen.getByText('Selecciona la fecha del evento.')).toBeTruthy()
    expect(screen.getByText('Ingresa el lugar del evento.')).toBeTruthy()
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
    await user.click(
      screen.getByRole('button', { name: 'Crear evento' }),
    )

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith(validInput)
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
})
