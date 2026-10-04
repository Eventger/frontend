import type {
  ReactNode,
} from 'react'

import { cn } from '@/lib/utils'
import { PageBreadcrumbs, type BreadcrumbItem } from './PageBreadcrumbs'

type PageContainerProps = {
  children: ReactNode
  className?: string
  breadcrumbs?: readonly BreadcrumbItem[]
}

export function PageContainer({
  children,
  className,
  breadcrumbs,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[var(--app-page-max-width)] px-[var(--app-page-gutter)] py-[var(--app-page-block-space)]',
        className,
      )}
    >
      {breadcrumbs && <PageBreadcrumbs items={breadcrumbs} />}
      {children}
    </div>
  )
}
