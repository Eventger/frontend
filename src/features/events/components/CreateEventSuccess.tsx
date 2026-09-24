import { Check } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import type { Event } from '@/features/events/types/event.types'

type CreateEventSuccessProps = {
  event: Event
}

export function CreateEventSuccess({
  event,
}: CreateEventSuccessProps) {
  const navigate = useNavigate()

  return (
    <section>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        Evento creado
      </h1>

      <div className="mx-auto mt-10 flex max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-5 py-10 text-center sm:px-10 md:mt-32 md:min-h-[430px] md:justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#ecfdf3]">
          <Check
            className="size-8 text-[#027a48]"
            strokeWidth={3}
          />
        </div>

        <h2 className="mt-7 max-w-[530px] text-xl font-bold text-[#17212b] sm:text-2xl">
          {event.name} se creó correctamente
        </h2>

        <p className="mt-4 max-w-[540px] text-sm leading-6 text-[#667085] sm:text-[15px]">
          El evento ya está disponible en tu lista de eventos.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:min-w-[174px]"
            onClick={() => navigate('/eventos')}
          >
            Volver a eventos
          </Button>

        </div>
      </div>
    </section>
  )
}
