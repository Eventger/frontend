import { useId } from 'react'

import { FeedbackIcon } from '@/components/feedback/FeedbackIcon'
import { Button } from '@/components/ui/button'

type LoadErrorStateProps = {
  title: string
  description: string
  iconLabel: string
  onRetry: () => void
  actionLabel?: string
  variant?:
    | 'default'
    | 'events'
    | 'embedded'
}

export function LoadErrorState({
  title,
  description,
  iconLabel,
  onRetry,
  actionLabel = 'Reintentar',
  variant = 'default',
}: LoadErrorStateProps) {
  const titleId = useId()
  const descriptionId = useId()
  const hasPageSpacing =
    variant === 'events'

  const state = (
    <section
      className="flex min-h-[280px] w-full flex-col items-center rounded-xl border border-border-subtle bg-white px-6 pb-6 pt-[38px] text-center"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <FeedbackIcon
        variant="error"
        label={iconLabel}
      />

      <h2
        id={titleId}
        className="mt-2.5 text-[clamp(1.3rem,3vw,1.5rem)] font-bold leading-[31px] text-[#17212b]"
      >
        {title}
      </h2>

      <p
        id={descriptionId}
        className="mt-[11px] w-full max-w-[660px] text-[14px] leading-5 text-[#667085]"
      >
        {description}
      </p>

      <Button
        type="button"
        onClick={onRetry}
        className="mt-10 h-11 w-full max-w-[170px] rounded-lg bg-[#4f46e5] px-5 text-[13px] font-semibold text-white hover:bg-[#4338ca]"
      >
        {actionLabel}
      </Button>
    </section>
  )

  if (!hasPageSpacing) {
    return state
  }

  return (
    <div className="mt-[74px] w-full max-w-[var(--app-content-max-width)]">
      {state}
    </div>
  )
}
