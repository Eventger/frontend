import {
  LoaderCircle,
} from 'lucide-react'
import { useId } from 'react'

import { FeedbackIcon } from '@/components/feedback/FeedbackIcon'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/layout/PageTitle'

export type FeedbackAction = {
  label: string
  onClick: () => void
  loading?: boolean
}

type OperationFeedbackProps = {
  pageTitle: string
  status: 'success' | 'error'
  title: string
  description: string
  primaryAction: FeedbackAction
  secondaryAction?: FeedbackAction
}

export function OperationFeedback({
  pageTitle,
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
}: OperationFeedbackProps) {
  const titleId = useId()
  const descriptionId = useId()
  const isSuccess = status === 'success'
  const isBusy = Boolean(
    primaryAction.loading ||
      secondaryAction?.loading,
  )

  return (
    <>
      <PageTitle>{pageTitle}</PageTitle>

      <div className="mt-8 w-full max-w-[var(--app-content-max-width)] md:mt-[146px]">
        <section
          className="mx-auto flex min-h-[430px] w-full max-w-[760px] flex-col items-center rounded-[16px] border border-[#dde2ea] bg-white px-6 py-10 sm:px-10 sm:pb-12 sm:pt-12"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          aria-busy={isBusy || undefined}
        >
          <div
            role={
              isSuccess
                ? 'status'
                : 'alert'
            }
            aria-live={
              isSuccess
                ? 'polite'
                : 'assertive'
            }
            aria-atomic="true"
            className="flex w-full flex-col items-center"
          >
            <FeedbackIcon
              variant={
                isSuccess
                  ? 'success'
                  : 'error'
              }
            />

            <h2
              id={titleId}
              className="mt-7 w-full max-w-[530px] text-center text-[clamp(1.35rem,3vw,1.5rem)] font-bold leading-8 text-[#17212b]"
            >
              {title}
            </h2>

            <p
              id={descriptionId}
              className="mt-8 w-full max-w-[540px] text-center text-[15px] leading-[22px] text-[#667085] sm:mt-12"
            >
              {description}
            </p>
          </div>

          <div className="mt-10 flex w-full max-w-[390px] flex-col justify-center gap-3 sm:mt-14 sm:max-w-none sm:flex-row-reverse sm:gap-5">
            <Button
              type="button"
              onClick={primaryAction.onClick}
              disabled={isBusy}
              className="h-11 w-full rounded-[10px] bg-[#4f46e5] px-5 text-white hover:bg-[#4338ca] sm:w-auto sm:min-w-[190px]"
            >
              {primaryAction.loading && (
                <LoaderCircle
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              {primaryAction.loading
                ? 'Procesando…'
                : primaryAction.label}
            </Button>

            {secondaryAction && (
              <Button
                type="button"
                variant="outline"
                onClick={
                  secondaryAction.onClick
                }
                disabled={isBusy}
                className="h-11 w-full rounded-[10px] sm:w-auto sm:min-w-[180px]"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
