import {
  useId,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { Info, X } from 'lucide-react'

function supportsHoverInput() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.(
      '(hover: hover)',
    ).matches ?? false)
  )
}

export function TodayPriorityGuide() {
  const [
    isHovered,
    setIsHovered,
  ] = useState(false)
  const [
    isFocused,
    setIsFocused,
  ] = useState(false)
  const [
    isTouchVisible,
    setIsTouchVisible,
  ] = useState(false)
  const ruleId = useId()
  const ruleTitleId = `${ruleId}-title`
  const isRuleVisible =
    isHovered ||
    isFocused ||
    isTouchVisible

  const handlePointerEnter = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.pointerType === 'mouse' &&
      supportsHoverInput()
    ) {
      setIsHovered(true)
    }
  }

  const handlePointerLeave = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.pointerType === 'mouse' &&
      supportsHoverInput()
    ) {
      setIsHovered(false)
    }
  }

  const handleBlur = (
    event: FocusEvent<HTMLDivElement>,
  ) => {
    if (
      !event.currentTarget.contains(
        event.relatedTarget as Node | null,
      )
    ) {
      setIsFocused(false)
    }
  }

  const handleClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    if (event.detail === 0) {
      return
    }

    if (!supportsHoverInput()) {
      setIsTouchVisible(
        (current) => !current,
      )
    }

    event.currentTarget.blur()
  }

  return (
    <div
      className={
        isRuleVisible
          ? 'relative z-30'
          : 'relative'
      }
    >
      <aside className="flex min-h-11 items-center rounded-lg border border-border-subtle bg-[#eef2ff] px-3 py-1.5 sm:py-0">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#4f46e5]">
          <Info
            className="size-3.5 text-white"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <p className="ml-3 min-w-0 flex-1 text-[12px] font-medium leading-[16px] text-[#17212b]">
          <span className="hidden sm:inline">Orden de Hoy: Vencidas → Para hoy → Próximas · Fecha define el orden · Empate: menor tiempo estimado.</span>
          <span className="sm:hidden">Prioridad: Vencidas → Hoy → Próximas</span>
        </p>

        <div
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocusCapture={() => setIsFocused(true)}
          onBlurCapture={handleBlur}
          className="relative ml-3 shrink-0 sm:ml-4"
        >
          <button
            type="button"
            onClick={handleClick}
            onKeyDown={(event) => {
              if (
                event.key === 'Escape'
              ) {
                setIsFocused(false)
                setIsTouchVisible(false)
                event.currentTarget.blur()
              }
            }}
            aria-expanded={
              isRuleVisible
            }
            aria-controls={ruleId}
            aria-haspopup="dialog"
            className="flex h-11 items-center whitespace-nowrap text-[12px] font-semibold text-[#3730a3] hover:text-[#312e81]"
          >
            ¿Cómo funciona?
          </button>

          {isRuleVisible && (
            <>
              <div aria-hidden="true" className="absolute right-0 top-11 h-2 w-full" />
              <div
                id={ruleId}
                role="dialog"
                aria-labelledby={ruleTitleId}
                className="absolute right-0 top-[48px] z-20 w-[min(380px,calc(100vw-2rem))] overflow-visible rounded-xl border border-border-subtle bg-white p-4 shadow-[0_10px_25px_rgba(23,33,43,0.12)]"
              >
                {/* Barra superior de acento índigo con curvatura perfecta y degradado sutil */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] rounded-t-[11px] bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#6366f1]"
                />

                {/* Flecha indicadora unificada en índigo, centrada bajo "¿Cómo funciona?" y sin cortes blancos */}
                <div
                  aria-hidden="true"
                  className="absolute -top-[6px] right-[38px] h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-[#4f46e5]"
                />

                <div className="flex items-center justify-between">
                  <p
                    id={ruleTitleId}
                    className="text-[13px] font-semibold leading-[18px] text-[#17212b]"
                  >
                    Regla de prioridad
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFocused(false)
                      setIsTouchVisible(false)
                      setIsHovered(false)
                    }}
                    aria-label="Cerrar regla de prioridad"
                    className="rounded-md p-1 text-[#98a2b3] hover:bg-[#f2f4f7] hover:text-[#344054]"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-2.5 space-y-1.5 text-[13px] leading-[19px] text-[#475467]">
                  <p>
                    Las subtareas se agrupan en
                    <strong className="font-semibold text-[#17212b]"> Vencidas</strong>,
                    <strong className="font-semibold text-[#17212b]"> Para hoy</strong> y
                    <strong className="font-semibold text-[#17212b]"> Próximas</strong> según su fecha objetivo.
                  </p>

                  <p>
                    Dentro de cada grupo se ordenan por fecha y, en caso de empate, se muestra primero la subtarea con menor tiempo estimado.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
