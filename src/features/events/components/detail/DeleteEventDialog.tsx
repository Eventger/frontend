import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          onOpenChange(
            nextOpen,
          )
        }
      }}
    >
      <DialogContent
        className="rounded-[18px] border-[#dde2ea] p-6 sm:max-w-[520px]"
        showCloseButton={false}
      >
        <DialogTitle className="text-[24px] font-bold text-[#17212b]">
          ¿Eliminar evento?
        </DialogTitle>

        <DialogDescription className="mt-4 text-[15px] leading-6 text-[#667085]">
          Se eliminarán el evento y
          todas sus tareas. Esta acción
          no se puede deshacer.
        </DialogDescription>

        <div className="mt-20 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() =>
              onOpenChange(false)
            }
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
              : 'Eliminar evento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}