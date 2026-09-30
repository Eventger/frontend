import { useState } from 'react'
import { Info } from 'lucide-react'

export function TodayPriorityGuide() {
  const [
    isRuleVisible,
    setIsRuleVisible,
  ] = useState(false)

  return (
    <div className="relative">
      <aside className="flex h-11 items-center rounded-[10px] border border-[#dde2ea] bg-white px-3">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eef2ff]">
          <Info
            className="size-3.5 text-[#4f46e5]"
            strokeWidth={2}
          />
        </div>

        <p className="ml-3 min-w-0 flex-1 text-[12px] leading-[15px] text-[#667085]">
          Orden de Hoy: Vencidas → Para hoy → Próximas · En empate, menor tiempo estimado primero.
        </p>

        <button
          type="button"
          onClick={() =>
            setIsRuleVisible(
              (current) => !current,
            )
          }
          className="ml-4 shrink-0 text-[12px] font-semibold text-[#3730a3] hover:text-[#312e81]"
        >
          {isRuleVisible
            ? 'Ocultar regla'
            : 'Ver regla'}
        </button>
      </aside>

      {isRuleVisible && (
        <div className="absolute right-0 top-[52px] z-20 w-[360px] overflow-visible rounded-[10px] border border-[#dde2ea] bg-white px-[13px] pb-[13px] pt-4 shadow-[0_6px_18px_rgba(23,33,43,0.08)]">
          <div className="absolute left-[-1px] right-[-1px] top-[-1px] h-[3px] rounded-t-[10px] bg-[#4f46e5]" />

          <div className="absolute -top-[7px] right-[22px] h-0 w-0 border-x-[6px] border-b-[7px] border-x-transparent border-b-[#dde2ea]" />

          <div className="absolute -top-[5px] right-[22px] h-0 w-0 border-x-[6px] border-b-[7px] border-x-transparent border-b-white" />

          <p className="text-[12px] font-semibold leading-[15px] text-[#17212b]">
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