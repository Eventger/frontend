import {
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { useId } from 'react'

import { Button } from '@/components/ui/button'

type LoadErrorStateProps = {
  title: string
  description: string
  iconLabel: string
  onRetry: () => void
  variant?: 'default' | 'events'
}

export function LoadErrorState({
  title,
  description,
  iconLabel,
  onRetry,
  variant = 'default',
}: LoadErrorStateProps) {
  const titleId = useId()
  const descriptionId = useId()
  const isEventsVariant =
    variant === 'events'

  const content = (
    <>
      {isEventsVariant ? (
        <div
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#feeeec] text-[28px] font-bold leading-none text-black"
        >
          <span className="-translate-y-px">!</span>
        </div>
      ) : (
        <TriangleAlert
          aria-hidden="true"
          className="size-12 text-[#b42318]"
        />
      )}

      <span className="sr-only">
        {iconLabel}
      </span>

      <h2
        id={titleId}
        className={
          isEventsVariant
            ? 'mt-2.5 text-[clamp(1.3rem,3vw,1.5rem)] font-bold leading-[31px] text-[#17212b]'
            : 'mt-5 text-xl font-bold text-[#17212b]'
        }
      >
        {title}
      </h2>

      <p
        id={descriptionId}
        className={
          isEventsVariant
            ? 'mt-[11px] w-full max-w-[660px] text-[14px] leading-[18px] text-[#667085]'
            : 'mt-2 max-w-md text-sm leading-6 text-[#667085]'
        }
      >
        {description}
      </p>

      <Button
        type="button"
        onClick={onRetry}
        className={
          isEventsVariant
            ? 'mt-10 h-11 w-full max-w-[170px] rounded-[10px] bg-[#4f46e5] px-5 text-[13px] font-semibold text-white hover:bg-[#4338ca]'
            : 'mt-6 h-11 rounded-[10px] bg-[#4f46e5] px-5 text-white hover:bg-[#4338ca]'
        }
      >
        {!isEventsVariant && (
          <RefreshCw aria-hidden="true" />
        )}
        Reintentar
      </Button>
    </>
  )

  const state = (
    <section
      className={
        isEventsVariant
          ? 'flex min-h-[280px] w-full flex-col items-center rounded-[12px] border border-[#dde2ea] bg-white px-6 pb-6 pt-[38px] text-center'
          : 'mx-auto flex min-h-[320px] max-w-[780px] flex-col items-center justify-center rounded-[18px] border border-[#dde2ea] bg-white px-6 text-center'
      }
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {content}
    </section>
  )

  if (!isEventsVariant) {
    return state
  }

  return (
    <div className="mt-[74px] w-full max-w-[var(--app-content-max-width)]">
      {state}
    </div>
  )
}
