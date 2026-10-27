import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type FieldErrorProps = {
  children: ReactNode
  id?: string
  className?: string
}

export function FieldError({
  children,
  id,
  className,
}: FieldErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        'type-caption text-[#b42318]',
        className,
      )}
    >
      {children}
    </p>
  )
}
