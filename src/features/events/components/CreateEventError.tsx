import { useNavigate } from 'react-router'

import { OperationFeedback } from '@/components/OperationFeedback'


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
    <OperationFeedback
      pageTitle="Evento no creado"
      status="error"
      title={`No pudimos crear ${eventName}`}
      description="Ocurrió un problema al guardar el evento. Conservamos la información que ingresaste para que puedas revisarla e intentarlo nuevamente."
      primaryAction={{
        label: 'Volver y revisar',
        onClick: onReview,
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
