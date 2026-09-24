import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  DeleteEventError,
  DeleteEventSuccess,
  EditEventError,
  EditEventSuccess,
} from '@/features/events/components/edit/EventOperationFeedback'
import { eventFixture } from './subtask.fixtures'

describe('EventOperationFeedback', () => {
  it('muestra el éxito de edición y ejecuta sus acciones', async () => {
    const user = userEvent.setup()
    const onContinueEditing = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <EditEventSuccess
        eventName={eventFixture.name}
        onContinueEditing={onContinueEditing}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Evento actualizado' }),
    ).toBeTruthy()
    expect(screen.getByText(new RegExp(eventFixture.name))).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Seguir editando' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(onContinueEditing).toHaveBeenCalledOnce()
    expect(onReturnToEvent).toHaveBeenCalledOnce()
  })

  it('muestra el error de edición y ejecuta retry y retorno', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <EditEventError
        isRetrying={false}
        onRetry={onRetry}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Cambios no guardados' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'No pudimos actualizar el evento' }),
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

  it('muestra el éxito de eliminación y permite volver al listado', async () => {
    const user = userEvent.setup()
    const onGoEvents = vi.fn()

    render(
      <DeleteEventSuccess
        eventName={eventFixture.name}
        onGoEvents={onGoEvents}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Evento eliminado' }),
    ).toBeTruthy()
    expect(screen.getByText(new RegExp(eventFixture.name))).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Volver a eventos' }),
    )
    expect(onGoEvents).toHaveBeenCalledOnce()
  })

  it('muestra el error de eliminación y ejecuta sus acciones', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <DeleteEventError
        eventName={eventFixture.name}
        isRetrying={false}
        onRetry={onRetry}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'No se pudo eliminar' }),
    ).toBeTruthy()
    expect(screen.getByText(new RegExp(eventFixture.name))).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(onRetry).toHaveBeenCalledOnce()
    expect(onReturnToEvent).toHaveBeenCalledOnce()
  })

  it('deshabilita retry mientras procesa', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <DeleteEventError
        eventName={eventFixture.name}
        isRetrying
        onRetry={onRetry}
        onReturnToEvent={vi.fn()}
      />,
    )

    const retryButton = screen.getByRole('button', { name: 'Procesando...' })
    expect((retryButton as HTMLButtonElement).disabled).toBe(true)

    await user.click(retryButton)
    expect(onRetry).not.toHaveBeenCalled()
  })
})
