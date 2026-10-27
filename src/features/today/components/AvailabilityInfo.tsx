import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { Info } from 'lucide-react'

type AvailabilityInfoProps = {
  align?: 'left' | 'right'
  side?: 'top' | 'bottom'
}

function supportsHoverInput() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(hover: hover)').matches ?? false)
  )
}

export function AvailabilityInfo({
  align = 'right',
  side = 'bottom',
}: AvailabilityInfoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClickVisible, setIsClickVisible] = useState(false)
  const [actualSide, setActualSide] = useState(side)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  const isOpen = isHovered || isClickVisible

  useEffect(() => {
    if (!isOpen) {
      setActualSide(side)
      return
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      if (side === 'top' && rect.top < 120) {
        setActualSide('bottom')
      } else if (side === 'bottom' && window.innerHeight - rect.bottom < 120) {
        setActualSide('top')
      } else {
        setActualSide(side)
      }
    }

    function handleClickOutside(event: globalThis.MouseEvent | globalThis.TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsClickVisible(false)
        setIsHovered(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsClickVisible(false)
        setIsHovered(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, side])

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && supportsHoverInput()) {
      setIsHovered(true)
    }
  }

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && supportsHoverInput()) {
      setIsHovered(false)
    }
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsClickVisible(false)
      setIsHovered(false)
    }
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) {
      return
    }

    setIsClickVisible((current) => !current)
  }

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlurCapture={handleBlur}
      className={`relative inline-flex items-center ${isOpen ? 'z-50' : ''}`}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsClickVisible(false)
            setIsHovered(false)
            event.currentTarget.blur()
          }
        }}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-label="Más información sobre horas disponibles"
        className="inline-flex size-11 items-center justify-center rounded-full text-[#667085] transition-colors hover:bg-[#f2f4f7] hover:text-[#17212b] focus-visible:outline-2 focus-visible:outline-[#4f46e5] md:size-6"
      >
        <Info size={14} aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          {/* Puente invisible continuo para retener el hover sin zonas muertas entre el icono y el tooltip */}
          <div
            aria-hidden="true"
            className={`absolute z-40 h-3 w-64 max-w-[calc(100vw-3rem)] ${
              actualSide === 'bottom' ? 'top-full' : 'bottom-full'
            } ${align === 'right' ? 'right-0' : 'left-0'}`}
          />
          <div
            id={tooltipId}
            role="tooltip"
            className={`absolute z-50 w-64 max-w-[calc(100vw-3rem)] rounded-lg border border-[#e4e7ec] bg-white p-3 text-xs leading-[18px] text-[#344054] shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 ${
              actualSide === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
            } ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            Estas horas nos ayudan a identificar cuándo tienes más trabajo programado del que puedes realizar.
            <div
              className={`absolute size-2 rotate-45 bg-white ${
                actualSide === 'bottom'
                  ? '-top-1 border-l border-t border-[#e4e7ec]'
                  : 'top-full -mt-1 border-b border-r border-[#e4e7ec]'
              } ${align === 'right' ? 'right-2' : 'left-2'}`}
            />
          </div>
        </>
      )}
    </div>
  )
}
