import type {
  ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type PageContentProps = {
  children: ReactNode
  className?: string
}

export function PageContent({
  children,
  className,
}: PageContentProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[var(--app-content-max-width)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
