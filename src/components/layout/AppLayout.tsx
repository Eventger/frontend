import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/layout/AppSidebar'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] md:flex">
      <AppSidebar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  )
}