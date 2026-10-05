import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

export type BreadcrumbItem = {
  label: string
  to?: string
  onNavigate?: () => void
}

type PageBreadcrumbsProps = {
  items: readonly BreadcrumbItem[]
}

export function PageBreadcrumbs({ items }: PageBreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Miga de pan" className="mb-3">
      <ol className="flex items-center gap-x-1 text-[13px] leading-5 text-[#667085]">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          const collapseOnMobile = index > 1 && !isCurrent

          return (
            <li key={`${index}-${item.label}`} className={`flex min-w-0 items-center gap-1 ${isCurrent ? 'max-w-[45%]' : index < 2 ? 'shrink-0' : 'shrink-0 sm:shrink'}`}>
              {index > 0 && <ChevronRight size={14} aria-hidden="true" className="shrink-0" />}
              {item.to && !isCurrent ? (
                <Link
                  to={item.to}
                  title={item.label}
                  viewTransition
                  onClick={(event) => {
                    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                      item.onNavigate?.()
                    }
                  }}
                  className="inline-flex min-h-11 min-w-0 items-center rounded-md px-1 transition-colors hover:bg-[#eef2ff] hover:text-[#4f46e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] sm:px-2"
                >
                  {collapseOnMobile ? (
                    <>
                      <span className="sr-only sm:not-sr-only sm:max-w-[24rem] sm:truncate">{item.label}</span>
                      <span aria-hidden="true" className="sm:hidden">…</span>
                    </>
                  ) : <span className="max-w-[14rem] truncate sm:max-w-[24rem]">{item.label}</span>}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined} title={item.label} className="block min-h-11 min-w-0 max-w-[14rem] truncate px-1 py-3 font-medium text-[#17212b] sm:max-w-[24rem] sm:px-2">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
