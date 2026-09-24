import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

export function EventNotFoundState() {
  const navigate = useNavigate()

  return (
    <section className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#17212b]">
          Evento no encontrado
        </h1>

        <p className="mt-3 text-sm text-[#667085]">
          El evento que intentas consultar no existe o ya no está disponible.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => navigate('/eventos')}
        >
          Volver a eventos
        </Button>
      </div>
    </section>
  )
}