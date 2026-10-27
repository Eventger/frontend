import type { ReactNode } from 'react'

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 tabIndex={-1} className="type-page-title min-w-0 break-words text-[#17212b] focus:outline-none">
      {children}
    </h1>
  )
}
