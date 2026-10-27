import { FeedbackIcon } from '@/components/feedback/FeedbackIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

type AuthFeedbackVariant =
  | 'error'
  | 'success'

type AuthFeedbackModalProps = {
  open: boolean
  variant: AuthFeedbackVariant

  title: string
  description: string

  secondaryLabel?: string
  primaryLabel?: string

  onSecondary?: () => void
  onPrimary?: () => void
}

export function AuthFeedbackModal({
  open,
  variant,
  title,
  description,
  secondaryLabel,
  primaryLabel,
  onSecondary,
  onPrimary,
}: AuthFeedbackModalProps) {
  if (!open) {
    return null
  }

  const isSuccess =
    variant === 'success'

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onSecondary?.()
        }
      }}
    >
      <DialogContent
        role={
          isSuccess
            ? 'dialog'
            : 'alertdialog'
        }
        className="z-[101] flex min-h-[430px] w-full max-w-[calc(100%-2rem)] flex-col items-center justify-center rounded-2xl border border-border-subtle bg-white px-6 py-10 sm:max-w-[760px] sm:px-10 sm:py-12"
        overlayClassName="z-[100] bg-[#101828]/45 backdrop-blur-none"
        showCloseButton={false}
      >
        <FeedbackIcon
          variant={
            isSuccess
              ? 'success'
              : 'error'
          }
          className="mx-auto"
        />

        <DialogTitle
          className="type-dialog-title mt-7 w-full max-w-[530px] text-center text-[#17212b]"
        >
          {title}
        </DialogTitle>

        <DialogDescription
          className="mt-8 w-full max-w-[540px] text-center text-[15px] leading-[22px] text-[#667085] sm:mt-12"
        >
          {description}
        </DialogDescription>

        {(secondaryLabel ||
          primaryLabel) && (
          <div className="mt-10 flex w-full max-w-[390px] flex-col justify-center gap-3 sm:mt-14 sm:max-w-none sm:flex-row-reverse sm:gap-5">
            {primaryLabel && (
              <Button
                type="button"
                onClick={onPrimary}
                className="h-11 w-full rounded-lg bg-[#4f46e5] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#4338ca] sm:w-[190px]"
              >
                {primaryLabel}
              </Button>
            )}

            {secondaryLabel && (
              <Button
                type="button"
                variant="outline"
                onClick={onSecondary}
                className="h-11 w-full rounded-lg border-border-subtle bg-white px-5 text-[14px] font-semibold text-[#17212b] hover:bg-[#f9fafb] sm:w-[180px]"
              >
                {secondaryLabel}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
