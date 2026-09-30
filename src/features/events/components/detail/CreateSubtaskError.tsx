import { OperationFeedback } from '@/components/OperationFeedback'

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
    <OperationFeedback
      pageTitle="Tarea no agregada"
      status="error"
      title={`No pudimos agregar ${subtaskName}`}
      description="Ocurrió un problema al guardar la tarea. Conservamos la información que ingresaste para que puedas intentarlo nuevamente."
      primaryAction={{
        label: 'Intentar de nuevo',
        onClick: onRetry,
        loading: isRetrying,
      }}
      secondaryAction={{
        label: 'Volver al evento',
        onClick: onReturnToEvent,
      }}
    />
  )
}
