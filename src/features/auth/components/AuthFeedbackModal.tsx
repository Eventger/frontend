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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101828]/45 px-4"
      role="presentation"
    >
      <section
        role={
          isSuccess
            ? 'status'
            : 'alertdialog'
        }
        aria-modal="true"
        aria-labelledby="auth-feedback-title"
        aria-describedby="auth-feedback-description"
        className="relative w-full max-w-[760px] rounded-[16px] border border-[#dde2ea] bg-white px-6 pb-8 pt-[47px] shadow-[0_24px_48px_rgba(16,24,40,0.18)] sm:px-[56px]"
      >
        <div
          className={[
            'mx-auto flex size-16 items-center justify-center rounded-full',
            isSuccess
              ? 'bg-[#ecfdf3]'
              : 'bg-[#feeeec]',
          ].join(' ')}
        >
          <span
            className={[
              'text-[34px] font-bold leading-none',
              isSuccess
                ? 'text-[#067647]'
                : 'text-[#b42318]',
            ].join(' ')}
            aria-hidden="true"
          >
            {isSuccess
              ? '✓'
              : '×'}
          </span>
        </div>

        <h2
          id="auth-feedback-title"
          className="mt-7 text-center text-[24px] font-bold leading-8 text-[#17212b]"
        >
          {title}
        </h2>

        <p
          id="auth-feedback-description"
          className="mx-auto mt-5 max-w-[540px] text-center text-[15px] leading-[22px] text-[#667085]"
        >
          {description}
        </p>

        {(secondaryLabel ||
          primaryLabel) && (
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-5">
            {secondaryLabel && (
              <button
                type="button"
                onClick={onSecondary}
                className="h-11 w-full rounded-[10px] border border-[#dde2ea] bg-white px-5 text-[14px] font-semibold text-[#17212b] transition-colors hover:bg-[#f9fafb] sm:w-[180px]"
              >
                {secondaryLabel}
              </button>
            )}

            {primaryLabel && (
              <button
                type="button"
                onClick={onPrimary}
                className="h-11 w-full rounded-[10px] bg-[#4f46e5] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#4338ca] sm:w-[190px]"
              >
                {primaryLabel}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}