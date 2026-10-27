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

const ROUTE_TITLES: Record<string, string> = {
  '/hoy': 'Hoy · Eventger',
  '/eventos': 'Eventos · Eventger',
  '/crear': 'Crear evento · Eventger',
  '/progreso': 'Progreso · Eventger',
  '/configuracion': 'Configuración · Eventger',
  '/configuracion/seguridad': 'Seguridad · Eventger',
}

function getRouteTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname]
  }
  if (pathname.startsWith('/evento/')) {
    return 'Detalle de evento · Eventger'
  }
  return 'Eventger'
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const mainRef =
    useRef<HTMLElement>(null)

  useDeferredScrollRestoration(mainRef)

  useEffect(() => {
    document.title = getRouteTitle(location.pathname)
  }, [location.pathname])

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#4f46e5] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Saltar al contenido
      </a>

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
