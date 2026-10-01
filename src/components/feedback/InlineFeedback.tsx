import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from 'lucide-react'
import type { ReactNode } from 'react'

import type { FeedbackVariant } from '@/components/feedback/FeedbackIcon'
import { cn } from '@/lib/utils'

type InlineFeedbackProps = {
  children: ReactNode
  variant?: FeedbackVariant
  className?: string
}

const variantStyles: Record<
  FeedbackVariant,
  string
> = {
  success:
    'border-[#abefc6] bg-[#ecfdf3] text-[#027a48]',
  error:
    'border-[#fecdca] bg-[#fef3f2] text-[#b42318]',
  warning:
    'border-[#fedf89] bg-[#fffaeb] text-[#b54708]',
  info:
    'border-[#c7d2fe] bg-[#eef2ff] text-[#3730a3]',
}

export function InlineFeedback({
  children,
  variant = 'error',
  className,
}: InlineFeedbackProps) {
  const icon = {
    success: CircleCheck,
    error: CircleAlert,
    warning: TriangleAlert,
    info: Info,
  }[variant]

  const Icon = icon
  const isError =
    variant === 'error'

  return (
    <div
      role={
        isError ? 'alert' : 'status'
      }
      aria-live={
        isError
          ? 'assertive'
          : 'polite'
      }
      aria-atomic="true"
      className={cn(
        'flex items-start gap-2 rounded-[8px] border px-3 py-2.5 text-[12px] leading-[18px]',
        variantStyles[
          variant
        ],
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className="mt-px size-4 shrink-0"
        strokeWidth={2.25}
      />
      <div className="min-w-0">
        {children}
      </div>
    </div>
  )
}
