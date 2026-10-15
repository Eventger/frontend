import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, CheckCircle2, CalendarClock, Eye } from 'lucide-react'
import type { TodayTaskItem } from '@/features/today/types/today.types'

type TodayTaskActionsMenuProps = {
  task: TodayTaskItem
  onRegisterProgress: (task: TodayTaskItem) => void
  onReschedule: (task: TodayTaskItem) => void
  onViewDetails: (task: TodayTaskItem) => void
  disabled?: boolean
}

export function TodayTaskActionsMenu({
  task,
  onRegisterProgress,
  onReschedule,
  onViewDetails,
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
      const menuHeight = 142
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
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    updatePosition()
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
    callback(task)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Acciones de ${task.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(value => !value)}
        className="relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-[#f2f4f7] hover:text-[#17212b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-wait disabled:opacity-50"
      >
        <MoreHorizontal size={20} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Acciones de ${task.name}`}
          style={{ top: position.top, left: position.left }}
          className="fixed z-[9999] w-[184px] rounded-[10px] border border-[#dde2ea] bg-white p-[6px] shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onRegisterProgress)}
            className="flex h-10 w-full items-center gap-2 rounded-md bg-[#eef2ff] px-3 text-left text-[13px] font-medium text-[#4f46e5] hover:bg-[#e0e7ff] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            Registrar avance
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onReschedule)}
            className="mt-[2px] flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-[13px] font-medium text-[#17212b] hover:bg-[#f2f4f7] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
          >
            <CalendarClock size={16} aria-hidden="true" />
            Reprogramar
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onViewDetails)}
            className="mt-[2px] flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-[13px] font-medium text-[#17212b] hover:bg-[#f2f4f7] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
          >
            <Eye size={16} aria-hidden="true" />
            Ver detalles
          </button>
        </div>,
        document.body,
      )}
    </>
  )
}