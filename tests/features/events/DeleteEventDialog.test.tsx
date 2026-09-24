import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DeleteEventDialog } from '@/features/events/components/detail/DeleteEventDialog'

function renderDialog(isDeleting = false) {
  const onOpenChange = vi.fn()
  const onConfirm = vi.fn()

  render(
    <DeleteEventDialog
      open
      isDeleting={isDeleting}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />,
  )

  return { onOpenChange, onConfirm }
}

describe('DeleteEventDialog', () => {
  it('explica el alcance y cancela sin eliminar', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onConfirm } = renderDialog()

    expect(
      screen.getByRole('heading', { name: '¿Eliminar evento?' }),
    ).toBeTruthy()
    expect(
      screen.getByText(/Se eliminarán el evento y todas sus tareas/),
    ).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirma únicamente mediante Eliminar evento', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onConfirm } = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Eliminar evento' }),
    )

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('cierra con Escape sin confirmar', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onConfirm } = renderDialog()

    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('bloquea cierre y confirmación mientras elimina', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onConfirm } = renderDialog(true)
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    const deleteButton = screen.getByRole('button', { name: 'Eliminando...' })

    expect((cancelButton as HTMLButtonElement).disabled).toBe(true)
    expect((deleteButton as HTMLButtonElement).disabled).toBe(true)

    await user.click(cancelButton)
    await user.click(deleteButton)
    await user.keyboard('{Escape}')

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
