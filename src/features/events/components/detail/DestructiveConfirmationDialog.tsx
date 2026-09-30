import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

type DestructiveConfirmationDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DestructiveConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DestructiveConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <DialogContent
        className="flex max-h-[calc(100svh-2rem)] min-h-[430px] flex-col items-center gap-0 overflow-y-auto rounded-[16px] border-[#dde2ea] bg-white px-6 py-10 shadow-none sm:max-w-[760px] sm:px-10 sm:pb-12 sm:pt-12 xl:left-[calc(50%+120px)]"
        overlayClassName="bg-[#17212b]/36 backdrop-blur-none xl:left-[var(--app-sidebar-width)]"
        showCloseButton={false}
      >
        <div
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#feeeec] text-[34px] font-bold leading-none text-[#b42318]"
        >
          <span className="-translate-y-px">!</span>
        </div>

        <DialogTitle className="mt-7 w-full max-w-[530px] text-center text-[clamp(1.35rem,3vw,1.5rem)] font-bold leading-8 text-[#17212b] sm:text-left">
          {title}
        </DialogTitle>

        <DialogDescription className="mt-8 w-full max-w-[540px] text-center text-[15px] leading-[22px] text-[#667085] sm:mt-12 sm:text-left">
          {description}
        </DialogDescription>

        <div className="mt-10 flex w-full max-w-[390px] flex-col-reverse gap-3 sm:mt-14 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="h-11 w-full rounded-[10px] border-[#d9dee7] bg-white text-[14px] font-semibold text-[#17212b] hover:bg-[#f8fafc] focus-visible:ring-[#667085]/25 sm:w-[180px]"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="h-11 w-full rounded-[10px] bg-[#c1241b] text-[14px] font-semibold text-white hover:bg-[#a81f18] focus-visible:ring-[#c1241b]/30 sm:w-[190px]"
          >
            {isDeleting
              ? 'Eliminando…'
              : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
