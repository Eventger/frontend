import {
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

import {
  Outlet,
  ScrollRestoration,
  useLocation,
} from 'react-router'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { useDeferredScrollRestoration } from './useDeferredScrollRestoration'

type AppLayoutProps = {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const mainRef =
    useRef<HTMLElement>(null)

  useDeferredScrollRestoration(mainRef)

  useEffect(() => {
    const animationFrame =
      window.requestAnimationFrame(
        () => {
          mainRef.current?.focus({
            preventScroll: true,
          })
        },
      )

    return () =>
      window.cancelAnimationFrame(
        animationFrame,
      )
  }, [location.key])

  return (
    <div className="min-h-svh bg-[#f7f8fc] xl:flex">
      <AppSidebar />

      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className="app-route-content min-w-0 flex-1 focus:outline-none"
      >
        {children ?? <Outlet />}
      </main>

      <ScrollRestoration />
    </div>
  )
}
