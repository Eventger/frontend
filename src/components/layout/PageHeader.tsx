import type { ReactNode } from 'react'
import { PageTitle } from './PageTitle'

type PageHeaderProps = {
  title: string
  description: ReactNode
  action?: ReactNode
}

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex min-h-16 items-start justify-between gap-4">
      <div className="min-w-0">
        <PageTitle>{title}</PageTitle>

        <p className="mt-1 text-[14px] leading-5 text-[#667085] md:text-[15px]">
          {description}
        </p>
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </header>
  )
}
