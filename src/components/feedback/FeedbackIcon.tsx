import {
  Check,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'

export type FeedbackVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

type FeedbackIconProps = {
  variant: FeedbackVariant
  size?: 'small' | 'large'
  label?: string
  className?: string
}

const variantStyles: Record<
  FeedbackVariant,
  string
> = {
  success:
    'bg-[#ecfdf3] text-[#027a48]',
  error:
    'bg-[#feeeec] text-[#b42318]',
  warning:
    'bg-[#fff4e5] text-[#b54708]',
  info:
    'bg-[#eef2ff] text-[#4f46e5]',
}

export function FeedbackIcon({
  variant,
  size = 'large',
  label,
  className,
}: FeedbackIconProps) {
  const iconClassName =
    size === 'large'
      ? 'size-8'
      : 'size-5'

  const icon = {
    success: Check,
    error: X,
    warning: TriangleAlert,
    info: Info,
  }[variant]

  const Icon = icon

  return (
    <span
      data-feedback-icon=""
      data-feedback-variant={variant}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        size === 'large'
          ? 'size-16'
          : 'size-10',
        variantStyles[
          variant
        ],
        className,
      )}
      aria-hidden={
        label ? undefined : true
      }
      role={
        label ? 'img' : undefined
      }
      aria-label={label}
    >
      <Icon
        className={iconClassName}
        strokeWidth={
          variant === 'warning'
            ? 2.25
            : 3
        }
      />
    </span>
  )
}
