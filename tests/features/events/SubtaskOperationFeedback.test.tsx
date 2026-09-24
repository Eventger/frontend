import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  DeleteSubtaskError,
  DeleteSubtaskSuccess,
  EditSubtaskError,
  EditSubtaskSuccess,
} from '@/features/events/components/detail/SubtaskOperationFeedback'
import { subtaskFixture } from './subtask.fixtures'

describe('SubtaskOperationFeedback', () => {
  it('muestra el éxito de edición y ejecuta sus acciones', async () => {
    const user = userEvent.setup()
    const onContinueEditing = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <EditSubtaskSuccess
        subtaskName={subtaskFixture.name}
        onContinueEditing={onContinueEditing}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Tarea actualizada' }),
    ).toBeTruthy()
    expect(screen.getByText(new RegExp(subtaskFixture.name))).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Seguir editando' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(onContinueEditing).toHaveBeenCalledOnce()
    expect(onReturnToEvent).toHaveBeenCalledOnce()
  })

  it('muestra el error de edición y permite reintentar o volver', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <EditSubtaskError
        isRetrying={false}
        onRetry={onRetry}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Cambios no guardados' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'No pudimos actualizar la tarea' }),
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

  it('muestra el éxito de eliminación con el nombre real', async () => {
    const user = userEvent.setup()
    const onReturnToEvent = vi.fn()

    render(
      <DeleteSubtaskSuccess
        subtaskName={subtaskFixture.name}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Tarea eliminada' }),
    ).toBeTruthy()
    expect(screen.getByText(new RegExp(subtaskFixture.name))).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )
    expect(onReturnToEvent).toHaveBeenCalledOnce()
  })

  it('muestra el error de eliminación y ejecuta sus acciones', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onReturnToEvent = vi.fn()

    render(
      <DeleteSubtaskError
        subtaskName={subtaskFixture.name}
        isRetrying={false}
        onRetry={onRetry}
        onReturnToEvent={onReturnToEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Tarea no eliminada' }),
    ).toBeTruthy()
    expect(screen.getByText(new RegExp(subtaskFixture.name))).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(onRetry).toHaveBeenCalledOnce()
    expect(onReturnToEvent).toHaveBeenCalledOnce()
  })

  it('deshabilita el retry mientras procesa', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <EditSubtaskError
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
