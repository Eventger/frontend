import type { ReactNode } from 'react'

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
        <h1 className="text-2xl font-bold leading-9 tracking-[-0.02em] text-[#17212b] md:text-[30px]">
          {title}
        </h1>

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
