import {
  Check,
  Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

type TodayEmptyStateProps = {
  onSeeUpcoming: () => void
  onCreateEvent: () => void
}

export function TodayEmptyState({
  onSeeUpcoming,
  onCreateEvent,
}: TodayEmptyStateProps) {
  return (
    <div className="mx-auto flex min-h-[400px] max-w-[780px] flex-col items-center justify-center rounded-[18px] border border-[#dde2ea] bg-white px-6 py-10 text-center">
      <Check
        aria-label="Sin gestiones pendientes"
        className="size-14 text-[#027a48]"
        strokeWidth={2.5}
      />

      <h2 className="mt-6 text-xl font-bold text-[#17212b] md:text-2xl">
        No tienes gestiones pendientes
        para hoy
      </h2>

      <p className="mt-4 max-w-[540px] text-sm leading-6 text-[#667085] md:text-[15px]">
        Buen trabajo. Puedes revisar
        próximas tareas o avanzar en
        otro evento.
      </p>

      <div className="mt-7 flex w-full max-w-[380px] flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={onSeeUpcoming}
          className="h-11 flex-1 rounded-[10px] bg-[#eef2ff] font-semibold text-[#3730a3] hover:bg-[#e0e7ff]"
        >
          Ver próximos días
        </Button>

        <Button
          type="button"
          onClick={onCreateEvent}
          className="h-11 flex-1 rounded-[10px] bg-[#4f46e5] font-semibold text-white hover:bg-[#4338ca]"
        >
          <Plus />
          Crear evento
        </Button>
      </div>
    </div>
  )
}