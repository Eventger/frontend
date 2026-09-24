import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DeleteSubtaskDialog } from '@/features/events/components/detail/DeleteSubtaskDialog'
import { subtaskFixture } from './subtask.fixtures'

function renderDialog(isDeleting = false) {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  render(
    <DeleteSubtaskDialog
      subtask={subtaskFixture}
      isDeleting={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
    />,
  )

  return { onClose, onConfirm }
}

describe('DeleteSubtaskDialog', () => {
  it('muestra la subtarea y no elimina al abrir ni al cancelar', async () => {
    const user = userEvent.setup()
    const { onClose, onConfirm } = renderDialog()

    expect(
      screen.getByRole('heading', { name: '¿Eliminar tarea?' }),
    ).toBeTruthy()
    expect(screen.getByText(subtaskFixture.name)).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirma la eliminación únicamente al pulsar su acción', async () => {
    const user = userEvent.setup()
    const { onClose, onConfirm } = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Eliminar tarea' }),
    )

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('cierra con Escape sin confirmar', async () => {
    const user = userEvent.setup()
    const { onClose, onConfirm } = renderDialog()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('evita acciones duplicadas mientras elimina', async () => {
    const user = userEvent.setup()
    const { onClose, onConfirm } = renderDialog(true)
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    const deleteButton = screen.getByRole('button', { name: 'Eliminando...' })

    expect((cancelButton as HTMLButtonElement).disabled).toBe(true)
    expect((deleteButton as HTMLButtonElement).disabled).toBe(true)

    await user.click(cancelButton)
    await user.click(deleteButton)
    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
