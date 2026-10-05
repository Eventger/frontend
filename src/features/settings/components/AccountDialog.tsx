import { useRef, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

type AccountDialogProps = {
  title: string
  description: string
  busy: boolean
  onClose: () => void
  children: ReactNode
}

export function AccountDialog({ title, description, busy, onClose, children }: AccountDialogProps) {
  const opener = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const content = useRef<HTMLDivElement>(null)
  return (
    // Release the focus trap while Clerk may open its identity-verification modal.
    <Dialog open modal={!busy} onOpenChange={(open) => { if (!open && !busy) onClose() }}>
      <DialogContent
        ref={content}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-[14px] bg-white p-6 text-[#17212b] sm:max-w-[480px]"
        showCloseButton={!busy}
        onOpenAutoFocus={(event) => { if (busy) event.preventDefault() }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          // Switching to the non-modal content for Clerk must not steal its focus.
          if (!content.current && opener.current?.isConnected) opener.current.focus({ preventScroll: true })
        }}
        onEscapeKeyDown={(event) => { if (busy) event.preventDefault() }}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogTitle className="pr-8 text-xl font-semibold leading-7">{title}</DialogTitle>
        <DialogDescription className="text-[13px] leading-5 text-[#667085]">{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}
