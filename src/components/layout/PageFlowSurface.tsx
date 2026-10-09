import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageFlowSurfaceProps = {
  children: ReactNode
  className?: string
}

export function PageFlowSurface({
  children,
  className,
}: PageFlowSurfaceProps) {
  return (
    <section
      className={cn(
        '-mx-4 rounded-none bg-white px-4 py-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
        'sm:-mx-6 sm:rounded-2xl sm:px-6',
        'md:-mx-7 md:px-7',
        className,
      )}
    >
      {children}
    </section>
  )
}
