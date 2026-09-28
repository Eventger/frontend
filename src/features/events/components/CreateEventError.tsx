import { X } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'


type CreateEventErrorProps = {
  eventName: string
  onReview: () => void
}


export function CreateEventError({
  eventName,
  onReview,
}: CreateEventErrorProps) {
  const navigate = useNavigate()

  return (
    <>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        Evento no creado
      </h1>

      <div className="mx-auto mt-[132px] flex min-h-[430px] w-full max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-6 py-12 text-center">

        {/* Icono de error */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#feeeec]">
          <X
            size={38}
            strokeWidth={3}
            className="text-[#b42318]"
          />
        </div>

        {/* Título */}
        <h2 className="mt-7 max-w-[530px] text-[24px] font-bold leading-[1.35] text-[#17212b]">
          No pudimos crear {eventName}
        </h2>

        {/* Mensaje */}
        <p className="mt-4 max-w-[540px] text-[15px] leading-6 text-[#667085]">
          Ocurrió un problema al guardar el evento.
          Conservamos la información que ingresaste
          para que puedas revisarla e intentarlo
          nuevamente.
        </p>

        {/* Botones */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate('/eventos')
            }
            className="h-11 min-w-[175px] rounded-[10px] border-[#dde2ea] text-[14px] font-semibold text-[#17212b]"
          >
            Volver a eventos
          </Button>

          <Button
            type="button"
            onClick={onReview}
            className="h-11 min-w-[190px] rounded-[10px] bg-[#4f46e5] text-[14px] font-semibold text-white hover:bg-[#4338ca]"
          >
            Volver y revisar
          </Button>

        </div>

      </div>
    </>
  )
}