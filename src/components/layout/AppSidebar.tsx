import { useState } from 'react'
import { Menu } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    label: 'Eventos',
    to: '/eventos',
  },
]

type SidebarContentProps = {
  onNavigate?: () => void
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const navigate = useNavigate()

  const handleCreateEvent = () => {
    navigate('/crear')
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-6 pt-7">
        <p className="text-[26px] leading-none font-bold text-[#3730a3]">
          Evento
        </p>

        <p className="mt-1 text-xs font-medium text-[#667085]">
          organizador
        </p>
      </div>

      <nav
        className="mt-10 flex flex-col gap-3 px-6"
        aria-label="Navegación principal"
      >
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center rounded-[10px] px-4',
                'text-sm font-medium text-[#17212b]',
                'transition-colors hover:bg-[#f7f8fc]',
                isActive &&
                  'bg-[#eef2ff] font-semibold text-[#3730a3]',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 px-6">
        <Button
          type="button"
          onClick={handleCreateEvent}
          className="h-11 w-full justify-start rounded-[10px] bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca] hover:cursor-pointer"
        >
          + Crear evento
        </Button>
      </div>

      <div className="mt-auto p-6">
        <button
          type="button"
          className="flex h-[68px] w-full items-center rounded-xl border border-[#dde2ea] bg-[#f9fafb] px-3 text-left"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-xs font-bold text-white">
            MN
          </span>

          <span className="ml-3 min-w-0">
            <span className="block truncate text-[13px] font-semibold text-[#17212b]">
              Mateo Noguera
            </span>

            <span className="mt-1 block text-[11px] font-medium text-[#667085]">
              Configuración
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function AppSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile */}
      <header className="flex h-16 items-center border-b border-[#dde2ea] bg-white px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
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
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <span className="ml-3 text-lg font-bold text-[#3730a3]">
          Evento
        </span>
      </header>

      {/* Desktop */}
      <aside className="hidden min-h-screen w-60 shrink-0 border-r border-[#dde2ea] bg-white md:block">
        <SidebarContent />
      </aside>
    </>
  )
}
