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
        className="z-[101] flex min-h-[430px] w-full max-w-[calc(100%-2rem)] flex-col rounded-2xl border border-border-subtle bg-white px-6 pb-[66px] pt-[47px] sm:block sm:max-w-[760px] sm:p-0"
        overlayClassName="z-[100] bg-[#101828]/45 backdrop-blur-none"
        showCloseButton={false}
      >
        <FeedbackIcon
          variant={
            isSuccess
              ? 'success'
              : 'error'
          }
          className="mx-auto sm:absolute sm:left-1/2 sm:top-[47px] sm:-translate-x-1/2"
        />

        <DialogTitle
          className="mt-7 text-center text-[24px] font-bold leading-8 text-[#17212b] sm:absolute sm:left-[115px] sm:right-[115px] sm:top-[139px] sm:mt-0"
        >
          {title}
        </DialogTitle>

        <DialogDescription
          className="mx-auto mt-8 max-w-[540px] text-center text-[15px] leading-[22px] text-[#667085] sm:absolute sm:left-[110px] sm:right-[110px] sm:top-[219px] sm:mt-0 sm:max-w-none"
        >
          {description}
        </DialogDescription>

        {(secondaryLabel ||
          primaryLabel) && (
          <div className="mt-auto flex flex-col justify-center gap-3 pt-8 sm:absolute sm:left-0 sm:right-0 sm:top-[319px] sm:mt-0 sm:flex-row-reverse sm:gap-5 sm:pt-0">
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
