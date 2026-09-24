import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CreateSubtaskError } from '@/features/events/components/detail/CreateSubtaskError'
import { CreateSubtaskSuccess } from '@/features/events/components/detail/CreateSubtaskSuccess'
import { eventFixture, subtaskFixture } from './subtask.fixtures'

describe('CreateSubtaskSuccess', () => {
  it('muestra los nombres reales y ejecuta sus acciones', async () => {
    const user = userEvent.setup()
    const onAddAnother = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <CreateSubtaskSuccess
        subtask={subtaskFixture}
        eventName={eventFixture.name}
        onAddAnother={onAddAnother}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: `${subtaskFixture.name} se agregó correctamente`,
      }),
    ).toBeTruthy()
    expect(screen.getByText(new RegExp(eventFixture.name))).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Agregar otra tarea' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(onAddAnother).toHaveBeenCalledOnce()
    expect(onReturnToEvent).toHaveBeenCalledOnce()
  })
})

describe('CreateSubtaskError', () => {
  it('muestra el nombre fallido y ejecuta retry y retorno', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <CreateSubtaskError
        subtaskName={subtaskFixture.name}
        onRetry={onRetry}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: `No pudimos agregar ${subtaskFixture.name}`,
      }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(onRetry).toHaveBeenCalledOnce()
    expect(onReturnToEvent).toHaveBeenCalledOnce()
  })
})
