import { useNavigate } from 'react-router'

import { OperationFeedback } from '@/components/OperationFeedback'

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
    <OperationFeedback
      pageTitle="Evento creado"
      status="success"
      title={`${event.name} se creó correctamente`}
      description="Ahora puedes entrar al evento y agregar las tareas necesarias para organizarlo."
      primaryAction={{
        label: 'Ver detalle del evento',
        onClick: () =>
          navigate(
            `/evento/${event.id}`,
            {
              viewTransition: true,
            },
          ),
      }}
      secondaryAction={{
        label: 'Volver a eventos',
        onClick: () =>
          navigate('/eventos', {
            viewTransition: true,
          }),
      }}
    />
  )
}
