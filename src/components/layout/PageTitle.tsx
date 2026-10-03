import type { ReactNode } from 'react'

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 tabIndex={-1} className="min-w-0 break-words text-2xl font-bold leading-9 tracking-[-0.02em] text-[#17212b] focus:outline-none md:text-[30px]">
      {children}
    </h1>
  )
}
