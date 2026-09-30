import type {
  ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type PageContainerProps = {
  children: ReactNode
  className?: string
}

export function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[var(--app-page-max-width)] px-[var(--app-page-gutter)] py-[var(--app-page-block-space)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
