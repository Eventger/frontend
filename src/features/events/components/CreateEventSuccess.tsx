import { Check } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

import type {
  Event,
} from '@/features/events/types/event.types'


type CreateEventSuccessProps = {
  event: Event
}


export function CreateEventSuccess({
  event,
}: CreateEventSuccessProps) {
  const navigate = useNavigate()

  return (
    <>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        Evento creado
      </h1>

      <div className="mx-auto mt-[132px] flex min-h-[430px] w-full max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-6 py-12 text-center">

        {/* Icono de éxito */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf3]">
          <Check
            size={38}
            strokeWidth={3}
            className="text-[#027a48]"
          />
        </div>

        {/* Título */}
        <h2 className="mt-7 max-w-[530px] text-[24px] font-bold leading-[1.35] text-[#17212b]">
          {event.name} se creó correctamente
        </h2>

        {/* Mensaje */}
        <p className="mt-4 max-w-[540px] text-[15px] leading-6 text-[#667085]">
          Ahora puedes entrar al evento y agregar las tareas necesarias para organizarlo.
        </p>

        {/* Botones */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate('/eventos')
            }
            className="h-11 min-w-[174px] rounded-[10px] border-[#dde2ea] text-[14px] font-semibold text-[#17212b]"
          >
            Volver a eventos
          </Button>

          <Button
            type="button"
            onClick={() =>
              navigate(
                `/evento/${event.id}`,
              )
            }
            className="h-11 min-w-[210px] rounded-[10px] bg-[#4f46e5] text-[14px] font-semibold text-white hover:bg-[#4338ca]"
          >
            Ver detalle del evento
          </Button>

        </div>

      </div>
    </>
  )
}