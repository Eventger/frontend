import {
  useId,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { Info } from 'lucide-react'

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
      onPointerEnter={
        handlePointerEnter
      }
      onPointerLeave={
        handlePointerLeave
      }
      onFocusCapture={() =>
        setIsFocused(true)
      }
      onBlurCapture={handleBlur}
      className={
        isRuleVisible
          ? 'relative z-30'
          : 'relative'
      }
    >
      <aside className="flex h-11 items-center rounded-[8px] border border-[#dde2ea] bg-[#eef2ff] px-3">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#4f46e5]">
          <Info
            className="size-3.5 text-white"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <p className="ml-3 min-w-0 flex-1 truncate text-[12px] font-medium leading-[15px] text-[#17212b]">
          Orden de Hoy: Vencidas → Para hoy → Próximas · Fecha define el orden · Empate: menor tiempo estimado.
        </p>

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
          className="ml-4 flex h-11 shrink-0 items-center text-[12px] font-semibold text-[#3730a3] hover:text-[#312e81]"
        >
          ¿Cómo funciona?
        </button>
      </aside>

      {isRuleVisible && (
        <div
          id={ruleId}
          role="dialog"
          aria-labelledby={ruleTitleId}
          className="absolute right-0 top-[52px] z-10 w-[min(360px,calc(100vw-2rem))] overflow-visible rounded-[10px] border border-[#dde2ea] bg-white px-[13px] pb-[13px] pt-4 shadow-[0_6px_18px_rgba(23,33,43,0.08)]"
        >
          <div className="absolute left-[-1px] right-[-1px] top-[-1px] h-[3px] rounded-t-[10px] bg-[#4f46e5]" />

          <div className="absolute -top-[7px] right-[22px] h-0 w-0 border-x-[6px] border-b-[7px] border-x-transparent border-b-[#dde2ea]" />

          <div className="absolute -top-[5px] right-[22px] h-0 w-0 border-x-[6px] border-b-[7px] border-x-transparent border-b-white" />

          <p
            id={ruleTitleId}
            className="text-[12px] font-semibold leading-[15px] text-[#17212b]"
          >
            Regla de prioridad
          </p>

          <div className="mt-2 text-[10.5px] leading-[15px] text-[#667085]">
            <p>
              Las subtareas se agrupan en
              Vencidas, Para hoy y Próximas
              según su fecha objetivo.
            </p>

            <p className="mt-1">
              Dentro de cada grupo se ordenan
              por fecha y, en caso de empate,
              se muestra primero la subtarea
              con menor tiempo estimado.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
