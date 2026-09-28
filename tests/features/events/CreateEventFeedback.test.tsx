import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CreateEventError } from '@/features/events/components/CreateEventError'
import { CreateEventSuccess } from '@/features/events/components/CreateEventSuccess'
import type { Event } from '@/features/events/types/event.types'

const navigate = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => navigate,
}))

const createdEvent: Event = {
  id: 21,
  name: 'Boda Laura y Daniel',
  typeId: 0,
  eventDate: '2099-12-31T00:00:00.000Z',
  location: 'Hacienda Las Palmas',
  contact: 'Laura 3001234567',
}

describe('CreateEventFeedback', () => {
  beforeEach(() => {
    navigate.mockReset()
  })

  it('permite volver al listado o abrir el evento creado', async () => {
    const user = userEvent.setup()

    render(<CreateEventSuccess event={createdEvent} />)

    expect(
      screen.getByRole('heading', {
        name: 'Boda Laura y Daniel se creó correctamente',
      }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Volver a eventos' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Ver detalle del evento' }),
    )

    expect(navigate).toHaveBeenNthCalledWith(1, '/eventos')
    expect(navigate).toHaveBeenNthCalledWith(2, '/evento/21')
  })

  it('conserva el nombre y permite revisar o abandonar un evento fallido', async () => {
    const user = userEvent.setup()
    const onReview = vi.fn()

    render(
      <CreateEventError
        eventName={createdEvent.name}
        onReview={onReview}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'No pudimos crear Boda Laura y Daniel',
      }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Volver y revisar' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver a eventos' }),
    )

    expect(onReview).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith('/eventos')
  })
})
