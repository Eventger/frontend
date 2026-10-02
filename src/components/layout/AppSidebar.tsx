import { useState } from 'react'
import {
  CalendarDays,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router'

import { useClerk, useUser } from '@clerk/react'

import { Button } from '@/components/ui/button'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { cn } from '@/lib/utils'

const navigationItems = [
  {
    label: 'Hoy',
    to: '/hoy',
  },
  {
    label: 'Eventos',
    to: '/eventos',
  },
]

type SidebarContentProps = {
  onNavigate?: () => void
}

function SidebarContent({
  onNavigate,
}: SidebarContentProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSigningOut, setIsSigningOut] =
    useState(false)
  const [signOutError, setSignOutError] =
    useState('')

  const { signOut } = useClerk()
  const {
    user,
    isLoaded,
    isSignedIn,
  } = useUser()
  const isEventsSection =
    location.pathname === '/eventos' ||
    location.pathname === '/crear' ||
    location.pathname.startsWith('/evento/')

  const handleCreateEvent = () => {
    navigate('/crear', {
      viewTransition: true,
    })
    onNavigate?.()
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setSignOutError('')

    try {
      await signOut({
        redirectUrl: '/',
      })

      onNavigate?.()
    } catch {
      setSignOutError(
        'No pudimos cerrar la sesión. Inténtalo de nuevo.',
      )
      setIsSigningOut(false)
    }
  }

  const handleOpenProfile = () => {
    navigate('/configuracion', { viewTransition: true })
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col bg-white">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#4f46e5]">
          <CalendarDays
            size={22}
            strokeWidth={2.2}
            className="text-white"
            aria-hidden="true"
          />
        </div>

        <span className="text-[20px] font-semibold text-[#17212b]">
          Eventger
        </span>
      </div>

      {/* Navegación */}
      <nav
        className="mt-10 flex flex-col gap-3 px-6"
        aria-label="Navegación principal"
      >
        {navigationItems.map((item) => {
          const isCurrent =
            item.to === '/eventos'
              ? isEventsSection
              : location.pathname === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              viewTransition
              onClick={onNavigate}
              aria-current={
                isCurrent
                  ? 'page'
                  : undefined
              }
              className={cn(
                'flex h-11 items-center rounded-[10px] px-4',
                'text-sm font-medium text-[#17212b]',
                'transition-colors hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]',
                isCurrent &&
                  'bg-[#eef2ff] font-semibold text-[#3730a3]',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Crear evento */}
      <div className="mt-10 px-6">
        <Button
          type="button"
          onClick={handleCreateEvent}
          aria-current={
            location.pathname === '/crear'
              ? 'page'
              : undefined
          }
          className="h-11 w-full justify-start rounded-[10px] bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:cursor-pointer hover:bg-[#4338ca]"
        >
          + Crear evento
        </Button>
      </div>

      {/* Parte inferior */}
      <div className="mt-auto p-6">

        {/* Usuario */}
        <button
          type="button"
          onClick={handleOpenProfile}
          disabled={!isLoaded || !isSignedIn}
          aria-label="Abrir configuración de cuenta"
          aria-current={location.pathname.startsWith('/configuracion') ? 'page' : undefined}
          className={cn(
            'group flex min-h-[68px] w-full items-center rounded-xl border border-[#dde2ea] bg-[#f9fafb] px-3 text-left transition-colors hover:border-[#c7d2fe] hover:bg-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
            location.pathname.startsWith('/configuracion') && 'border-[#4f46e5] bg-[#eef2ff]',
          )}
        >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-xs font-bold text-white">
              {isLoaded && isSignedIn
                  ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
                    .toUpperCase() || 'U'
                : 'U'}
            </span>

            <span className="ml-3 min-w-0">
              <span className="block truncate text-[13px] font-semibold text-[#17212b]">
                {isLoaded && isSignedIn
                  ? user.fullName || 'Usuario'
                  : 'Usuario'}
              </span>

              <span className="mt-1 block truncate text-[11px] font-medium text-[#667085]">
                {isLoaded && isSignedIn
                  ? user.primaryEmailAddress?.emailAddress ?? 'Cuenta de usuario'
                  : 'Cuenta de usuario'}
              </span>
            </span>

            <ChevronRight
              className="ml-auto size-4 shrink-0 text-[#98a2b3] transition-transform group-hover:translate-x-0.5 group-hover:text-[#4f46e5]"
              aria-hidden="true"
            />
        </button>

        {/* Cerrar sesión */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-3 flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-[#667085] transition-colors hover:bg-[#fef2f2] hover:text-[#b42318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut size={18} aria-hidden="true" />

          <span>
            {isSigningOut
              ? 'Cerrando sesión…'
              : 'Cerrar sesión'}
          </span>
        </button>

        {signOutError && (
          <InlineFeedback
            className="mt-2 px-2.5"
          >
            {signOutError}
          </InlineFeedback>
        )}
      </div>
    </div>
  )
}

export function AppSidebar() {
  const [open, setOpen] =
    useState(false)

  return (
    <>
      {/* Mobile */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#dde2ea] bg-white/95 px-4 backdrop-blur xl:hidden">
        <Sheet
          open={open}
          onOpenChange={setOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              className="size-11"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[260px] p-0"
          >
            <SheetTitle className="sr-only">
              Navegación
            </SheetTitle>

            <SidebarContent
              onNavigate={() =>
                setOpen(false)
              }
            />
          </SheetContent>
        </Sheet>

        <span className="ml-3 text-lg font-bold text-[#3730a3]">
          Eventger
        </span>
      </header>

      {/* Desktop */}
      <aside className="hidden h-svh w-[var(--app-sidebar-width)] shrink-0 border-r border-[#dde2ea] bg-white xl:sticky xl:top-0 xl:block">
        <SidebarContent />
      </aside>
    </>
  )
}
