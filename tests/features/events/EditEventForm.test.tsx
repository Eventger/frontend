import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EditEventForm } from '@/features/events/components/edit/EditEventForm'
import { eventFixture } from './subtask.fixtures'

const eventTypes = [
  {
    id: eventFixture.typeId,
    name: 'Boda',
    description: 'Evento de boda.',
  },
]

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <EditEventForm
      event={eventFixture}
      eventTypes={eventTypes}
      isSubmitting={false}
      onSubmit={onSubmit}
      onCancel={vi.fn()}
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
})
