import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

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
    <Dialog
      open
      onOpenChange={(open) => {
        if (
          !open &&
          !isDeleting
        ) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="rounded-[18px] border-[#dde2ea] p-6 sm:max-w-[520px]"
        showCloseButton={false}
      >
        <DialogTitle className="text-[24px] font-bold text-[#17212b]">
          ¿Eliminar tarea?
        </DialogTitle>

        <DialogDescription className="mt-4 text-[15px] leading-6 text-[#667085]">
          Esta acción eliminará{' '}
          <span className="font-medium text-[#17212b]">
            {subtask.name}
          </span>{' '}
          y su información. El evento y
          las demás tareas no se verán
          afectados. No se puede
          deshacer.
        </DialogDescription>

        <div className="mt-16 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="h-11 rounded-[10px] sm:w-[140px]"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="h-11 rounded-[10px] bg-[#b42318] text-white hover:bg-[#912018] sm:w-[160px]"
          >
            {isDeleting
              ? 'Eliminando...'
              : 'Eliminar tarea'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}