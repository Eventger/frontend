import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TodayEmptyStateProps = {
  onViewUpcoming: () => void
  onCreateEvent: () => void
  isFirstTime?: boolean
}

export function TodayEmptyState({
  onViewUpcoming,
  onCreateEvent,
  isFirstTime = false,
}: TodayEmptyStateProps) {
  return (
    <section className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-border-subtle bg-white px-6 py-8 text-center">
      {isFirstTime ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f46e5]">
          <Sparkles className="size-8" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex h-[56px] items-center justify-center text-[52px] font-bold leading-none text-[#027a48]">
          ✓
        </div>
      )}

      <h2 className="type-dialog-title mt-[24px] text-[#17212b]">
        No tienes gestiones pendientes para hoy
      </h2>

      <p className="mt-3 min-h-[48px] max-w-[540px] text-[15px] leading-relaxed text-[#667085]">
        {isFirstTime
          ? 'Te damos la bienvenida a Eventger. Aún no tienes tareas programadas: crea tu primer evento para comenzar a planificar tus actividades y balancear tu tiempo diario.'
          : 'Buen trabajo. Puedes revisar próximas tareas o avanzar en otro evento.'}
      </p>

      <div className="mt-[28px] flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4">
        {isFirstTime ? (
          <>
            <Button
              type="button"
              onClick={onCreateEvent}
              className="h-11 w-full rounded-lg bg-[#4f46e5] px-5 text-[14px] font-semibold text-white hover:bg-[#4338ca] sm:w-auto"
            >
              + Crear evento
            </Button>

            <Button
              type="button"
              onClick={onViewUpcoming}
              variant="secondary"
              className="h-11 w-full rounded-lg bg-[#eef2ff] px-4 text-[14px] font-semibold text-[#4f46e5] hover:bg-[#e0e7ff] sm:w-auto"
            >
              Ver próximos días
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={onViewUpcoming}
              variant="secondary"
              className="h-11 w-full rounded-lg bg-[#eef2ff] px-4 text-[14px] font-semibold text-[#4f46e5] hover:bg-[#e0e7ff] sm:w-[190px]"
            >
              Ver próximos días
            </Button>

            <Button
              type="button"
              onClick={onCreateEvent}
              className="h-11 w-full rounded-lg bg-[#4f46e5] px-4 text-[14px] font-semibold text-white hover:bg-[#4338ca] sm:w-[170px]"
            >
              + Crear evento
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
