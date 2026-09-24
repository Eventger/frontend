import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

type CreateSubtaskErrorProps = {
  subtaskName: string
  isRetrying?: boolean
  onRetry: () => void
  onReturnToEvent: () => void
}

export function CreateSubtaskError({
  subtaskName,
  isRetrying = false,
  onRetry,
  onReturnToEvent,
}: CreateSubtaskErrorProps) {
  return (
    <>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        Tarea no agregada
      </h1>

      <section className="mx-auto mt-10 flex min-h-[430px] w-full max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-6 py-12 text-center md:mt-[135px]">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#feeeec]">
          <X
            className="size-8 text-[#b42318]"
            strokeWidth={3}
          />
        </div>

        <h2 className="mt-7 max-w-[530px] text-[24px] font-bold text-[#17212b]">
          No pudimos agregar{' '}
          {subtaskName}
        </h2>

        <p className="mt-4 max-w-[540px] text-[15px] leading-6 text-[#667085]">
          Ocurrió un problema al guardar
          la tarea. Conservamos la
          información que ingresaste para
          que puedas intentarlo nuevamente.
        </p>

        <div className="mt-8 flex w-full flex-col-reverse justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={isRetrying}
            onClick={onReturnToEvent}
            className="h-11 rounded-[10px] sm:w-[180px]"
          >
            Volver al evento
          </Button>

          <Button
            type="button"
            disabled={isRetrying}
            onClick={onRetry}
            className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[190px]"
          >
            {isRetrying
              ? 'Guardando...'
              : 'Intentar de nuevo'}
          </Button>
        </div>
      </section>
    </>
  )
}