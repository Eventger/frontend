import { useState } from 'react'
import {
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  ChartNoAxesColumnIncreasing,
  LogOut,
  Menu,
  Settings,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useClerk, useUser } from '@clerk/react'
import { Avatar } from 'radix-ui'

import { Button } from '@/components/ui/button'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navigationItems = [
  { label: 'Hoy', to: '/hoy', icon: CalendarCheck2 },
  { label: 'Eventos', to: '/eventos', icon: CalendarRange },
  { label: 'Progreso', to: '/progreso', icon: ChartNoAxesColumnIncreasing },
]

type SidebarContentProps = { onNavigate?: () => void }

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const { signOut } = useClerk()
  const { user, isLoaded, isSignedIn } = useUser()
  const displayName = isLoaded && isSignedIn
    ? user.firstName?.trim() || user.fullName?.trim().split(/\s+/)[0] || 'Usuario'
    : 'Usuario'
  const isEventsSection = location.pathname === '/eventos'
    || location.pathname === '/crear'
    || location.pathname.startsWith('/evento/')
  const isSettingsSection = location.pathname.startsWith('/configuracion')

  const handleCreateEvent = () => {
    navigate('/crear', { viewTransition: true })
    onNavigate?.()
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setSignOutError('')
    try {
      sessionStorage.setItem('eventger_signed_out', 'true')
      await signOut({ redirectUrl: '/' })
      onNavigate?.()
    } catch {
      sessionStorage.removeItem('eventger_signed_out')
      setSignOutError('No pudimos cerrar la sesión. Inténtalo de nuevo.')
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-6 pt-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#4f46e5]">
          <CalendarDays size={22} strokeWidth={2.2} className="text-white" aria-hidden="true" />
        </div>
        <span className="text-[20px] font-semibold text-[#17212b]">Eventger</span>
      </div>

      <nav className="mt-10 flex flex-col gap-3 px-6" aria-label="Navegación principal">
        {navigationItems.map(item => {
          const Icon = item.icon
          const isCurrent = item.to === '/eventos'
            ? isEventsSection
            : item.to === '/progreso'
              ? location.pathname === '/progreso'
              : location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              viewTransition
              onClick={onNavigate}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center rounded-lg px-4 text-sm font-medium leading-5 text-[#17212b]',
                'transition-colors hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]',
                isCurrent && 'bg-[#eef2ff] font-semibold text-[#3730a3]',
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span className="ml-3">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-10 px-6">
        <Button
          type="button"
          onClick={handleCreateEvent}
          aria-current={location.pathname === '/crear' ? 'page' : undefined}
          className={cn(
            'h-11 w-full justify-start rounded-lg px-4 text-sm font-semibold transition-colors',
            location.pathname === '/crear'
              ? 'border border-[#c7d2fe] bg-[#eef2ff] text-[#3730a3] hover:bg-[#e0e7ff]'
              : 'bg-[#4f46e5] text-white hover:cursor-pointer hover:bg-[#4338ca]',
          )}
        >
          + Crear evento
        </Button>
      </div>

      <div className="mx-6 mt-6 border-t border-border-subtle pt-6">
        <nav aria-label="Cuenta">
          <Link
            to="/configuracion"
            viewTransition
            onClick={onNavigate}
            aria-label="Configuración, Perfil y preferencias"
            aria-current={isSettingsSection ? 'page' : undefined}
            className={cn(
              'flex min-h-14 items-center rounded-lg px-4 text-sm font-medium leading-5 text-[#17212b]',
              'transition-colors hover:bg-[#f7f8fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]',
              isSettingsSection && 'bg-[#eef2ff] font-semibold text-[#3730a3]',
            )}
          >
            <Settings className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="ml-3 min-w-0">
              <span className="block leading-5">Configuración</span>
              <span className={cn('type-caption block truncate font-normal', isSettingsSection ? 'text-[#4f46e5]' : 'text-[#667085]')}>
                Perfil y preferencias
              </span>
            </span>
          </Link>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div
          role="group"
          aria-label={`Sesión actual: ${displayName}`}
          className="flex min-h-[58px] w-full items-center rounded-xl bg-[#f9fafb] p-2"
        >
          <Avatar.Root className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4f46e5] text-xs font-bold text-white">
            <Avatar.Image
              src={isLoaded && isSignedIn && user.hasImage ? user.imageUrl : undefined}
              alt=""
              width={36}
              height={36}
              className="size-full object-cover"
            />
            <Avatar.Fallback className="flex size-full items-center justify-center">
              {isLoaded && isSignedIn
                ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
                : 'U'}
            </Avatar.Fallback>
          </Avatar.Root>
          <span title={displayName} className="ml-3 mr-2 min-w-0 flex-1 truncate text-[13px] font-semibold text-[#17212b]">
            {displayName}
          </span>
        </div>

        <div className="mt-2 border-t border-border-subtle pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex h-11 w-full items-center gap-0 rounded-lg px-4 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#fef2f2] hover:text-[#b42318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="ml-3 leading-5">{isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
          </button>
        </div>
        {signOutError && <InlineFeedback className="mt-2 px-2.5">{signOutError}</InlineFeedback>}
      </div>
    </div>
  )
}

export function AppSidebar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border-subtle bg-white/95 px-4 backdrop-blur xl:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú" className="size-11">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetTitle className="sr-only">Navegación</SheetTitle>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="ml-3 text-lg font-bold text-[#3730a3]">Eventger</span>
      </header>

      <aside
        aria-label="Barra lateral de navegación"
        className="hidden h-svh w-[var(--app-sidebar-width)] shrink-0 border-r border-border-subtle bg-white xl:sticky xl:top-0 xl:block"
      >
        <SidebarContent />
      </aside>
    </>
  )
}
