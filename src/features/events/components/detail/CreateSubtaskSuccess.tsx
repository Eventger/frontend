import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Subtask } from '@/features/events/types/subtask.types'

type CreateSubtaskSuccessProps = {
  subtask: Subtask
  eventName: string
  onAddAnother: () => void
  onReturnToEvent: () => void
}

export function CreateSubtaskSuccess({
  subtask,
  eventName,
  onAddAnother,
  onReturnToEvent,
}: CreateSubtaskSuccessProps) {
  return (
    <>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        Tarea agregada
      </h1>

      <section className="mx-auto mt-10 flex min-h-[430px] w-full max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-6 py-12 text-center md:mt-[135px]">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#ecfdf3]">
          <Check
            className="size-8 text-[#027a48]"
            strokeWidth={3}
          />
        </div>

        <h2 className="mt-7 max-w-[530px] text-[24px] font-bold text-[#17212b]">
          {subtask.name} se agregó
          correctamente
        </h2>

        <p className="mt-4 max-w-[540px] text-[15px] leading-6 text-[#667085]">
          La tarea ya hace parte del plan
          logístico de {eventName}.
        </p>

        <div className="mt-10 flex w-full flex-col-reverse justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onAddAnother}
            className="h-11 rounded-[10px] sm:w-[190px]"
          >
            Agregar otra tarea
          </Button>

          <Button
            type="button"
            onClick={onReturnToEvent}
            className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[190px]"
          >
            Volver al evento
          </Button>
        </div>
      </section>
    </>
  )
}