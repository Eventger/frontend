import { useNavigate } from 'react-router'

import { LoadErrorState } from '@/components/LoadErrorState'

export function EventNotFoundState() {
  const navigate = useNavigate()

  return (
    <LoadErrorState
      title="Evento no encontrado"
      description="El evento que intentas consultar no existe o ya no está disponible."
      iconLabel="Evento no encontrado"
      actionLabel="Volver a eventos"
      variant="events"
      onRetry={() =>
        navigate('/eventos', {
          viewTransition: true,
        })
      }
    />
  )
}
