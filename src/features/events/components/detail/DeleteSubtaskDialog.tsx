import { DestructiveConfirmationDialog } from '@/features/events/components/detail/DestructiveConfirmationDialog'

import type { Subtask } from '@/features/events/types/subtask.types'

type DeleteSubtaskDialogProps = {
  subtask: Subtask
  isDeleting?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSubtaskDialog({
  subtask,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteSubtaskDialogProps) {
  return (
    <DestructiveConfirmationDialog
      open
      title="¿Eliminar tarea?"
      description={
        <>
          Esta acción eliminará <span>{subtask.name}</span> y su información. El
          evento y las demás tareas no se verán afectados. No se puede deshacer.
        </>
      }
      confirmLabel="Eliminar tarea"
      isDeleting={isDeleting}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      onConfirm={onConfirm}
    />
  )
}
