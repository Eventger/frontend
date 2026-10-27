import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarClock, ChevronDown, Eye, EyeOff, ListTodo, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TodayTaskItem } from '@/features/today/types/today.types'

type TodayTaskActionsMenuProps = {
  task: TodayTaskItem
  onRegisterProgress: (task: TodayTaskItem) => void
  onReschedule: (task: TodayTaskItem) => void
  onViewDetails: (task: TodayTaskItem) => void
  isDetailsOpen?: boolean
  disabled?: boolean
}

export function TodayTaskActionsMenu({
  task,
  onRegisterProgress,
  onReschedule,
  onViewDetails,
  isDetailsOpen = false,
  disabled = false,
}: TodayTaskActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const menuWidth = 184
      const measuredHeight = menuRef.current?.offsetHeight
      const menuHeight = measuredHeight && measuredHeight > 0
        ? measuredHeight
        : (window.matchMedia('(min-width: 640px)').matches ? 86 : 142)
      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      )
      const top = rect.bottom + menuHeight > window.innerHeight - 8
        ? Math.max(8, rect.top - menuHeight - 6)
        : rect.bottom + 6
      setPosition({ top, left })
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!menuRef.current) return
        const items = Array.from(menuRef.current.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not([disabled])'))
        if (items.length === 0) return
        const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
        if (event.key === 'ArrowDown') {
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          items[nextIndex]?.focus()
        } else {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          items[prevIndex]?.focus()
        }
      }
    }

    updatePosition()
    requestAnimationFrame(() => {
      if (menuRef.current) {
        const firstItem = menuRef.current.querySelector<HTMLButtonElement>('button[role="menuitem"]:not([disabled])')
        firstItem?.focus()
      }
    })
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  const choose = (callback: (task: TodayTaskItem) => void) => {
    setOpen(false)
    triggerRef.current?.focus()
    callback(task)
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        title={`Acciones de ${task.name}`}
        aria-label={`Acciones de ${task.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(value => !value)}
        className="relative z-20 size-11 shrink-0 rounded-lg border-[#dde2ea] bg-white p-0 text-[#344054] shadow-sm hover:bg-[#f9fafb] hover:text-[#17212b] disabled:cursor-wait disabled:opacity-50 sm:h-9 sm:w-auto sm:px-3"
      >
        <SlidersHorizontal className="size-5 text-[#667085] sm:hidden" strokeWidth={2} aria-hidden="true" />
        <SlidersHorizontal className="hidden size-4 text-[#667085] sm:block" aria-hidden="true" />
        <span className="hidden text-[13px] font-medium sm:inline">Acciones</span>
        <ChevronDown
          className={cn('hidden size-3.5 text-[#667085] transition-transform duration-200 sm:block', open && 'rotate-180')}
          aria-hidden="true"
        />
      </Button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Acciones de ${task.name}`}
          style={{ top: position.top, left: position.left }}
          className="fixed z-[9999] w-[184px] rounded-xl border border-[#dde2ea] bg-white p-[6px] shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onRegisterProgress)}
            className="flex min-h-11 w-full items-center gap-2 rounded-md bg-[#eef2ff] px-3 text-left text-[13px] font-medium text-[#3730a3] hover:bg-[#e0e7ff] focus-visible:outline-2 focus-visible:outline-[#4f46e5] sm:hidden"
          >
            <ListTodo size={16} aria-hidden="true" />
            Registrar avance
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onReschedule)}
            className="mt-[2px] flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-[13px] font-medium text-[#17212b] hover:bg-[#f2f4f7] focus-visible:outline-2 focus-visible:outline-[#4f46e5] sm:min-h-9"
          >
            <CalendarClock size={16} aria-hidden="true" />
            Reprogramar
          </button>
          <button
            type="button"
            role="menuitem"
            aria-label={`${isDetailsOpen ? 'Ocultar' : 'Ver'} detalles de ${task.name}`}
            onClick={() => choose(onViewDetails)}
            className="mt-[2px] flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-[13px] font-medium text-[#17212b] hover:bg-[#f2f4f7] focus-visible:outline-2 focus-visible:outline-[#4f46e5] sm:min-h-9"
          >
            {isDetailsOpen ? (
              <>
                <EyeOff size={16} aria-hidden="true" />
                Ocultar detalles
              </>
            ) : (
              <>
                <Eye size={16} aria-hidden="true" />
                Ver detalles
              </>
            )}
          </button>
        </div>,
        document.body,
      )}
    </>
  )
}
