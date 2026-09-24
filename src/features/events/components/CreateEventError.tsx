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
    <section>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        Evento no creado
      </h1>

      <div className="mx-auto mt-10 flex max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-5 py-10 text-center sm:px-10 md:mt-32 md:min-h-[430px] md:justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#feeeec]">
          <X
            className="size-8 text-[#b42318]"
            strokeWidth={3}
          />
        </div>

        <h2 className="mt-7 max-w-[530px] text-xl font-bold text-[#17212b] sm:text-2xl">
          No pudimos crear {eventName}
        </h2>

        <p className="mt-4 max-w-[540px] text-sm leading-6 text-[#667085] sm:text-[15px]">
          Ocurrió un problema al guardar el evento. Conservamos la información
          que ingresaste para que puedas revisarla e intentarlo nuevamente.
        </p>

        <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:min-w-[175px]"
            onClick={() => navigate('/eventos')}
          >
            Volver a eventos
          </Button>

          <Button
            type="button"
            className="h-11 bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:min-w-[190px]"
            onClick={onReview}
          >
            Volver y revisar
          </Button>
        </div>
      </div>
    </section>
  )
}