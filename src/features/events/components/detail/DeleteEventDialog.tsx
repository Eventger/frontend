import { DestructiveConfirmationDialog } from '@/features/events/components/detail/DestructiveConfirmationDialog'

type DeleteEventDialogProps = {
  open: boolean
  isDeleting: boolean
  onOpenChange: (
    open: boolean,
  ) => void
  onConfirm: () => void
}

export function DeleteEventDialog({
  open,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteEventDialogProps) {
  return (
    <DestructiveConfirmationDialog
      open={open}
      title="¿Eliminar evento?"
      description="Se eliminarán el evento y todas sus tareas. Esta acción no se puede deshacer."
      confirmLabel="Eliminar evento"
      isDeleting={isDeleting}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  )
}
