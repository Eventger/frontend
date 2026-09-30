import { OperationFeedback } from '@/components/OperationFeedback'

type EditSubtaskSuccessProps = {
  subtaskName: string
  onContinueEditing: () => void
  onReturnToEvent: () => void
}

export function EditSubtaskSuccess({
  subtaskName,
  onContinueEditing,
  onReturnToEvent,
}: EditSubtaskSuccessProps) {
  return (
    <OperationFeedback
      pageTitle="Tarea actualizada"
      status="success"
      title="Los cambios se guardaron correctamente"
      description={`La información de ${subtaskName} fue actualizada en el plan logístico.`}
      secondaryAction={{
        label: 'Seguir editando',
        onClick: onContinueEditing,
      }}
      primaryAction={{
        label: 'Volver al evento',
        onClick: onReturnToEvent,
      }}
    />
  )
}

type EditSubtaskErrorProps = {
  isRetrying: boolean
  onRetry: () => void
  onReturnToEvent: () => void
}

export function EditSubtaskError({
  isRetrying,
  onRetry,
  onReturnToEvent,
}: EditSubtaskErrorProps) {
  return (
    <OperationFeedback
      pageTitle="Cambios no guardados"
      status="error"
      title="No pudimos actualizar la tarea"
      description="Ocurrió un problema al guardar los cambios. Conservamos la información que ingresaste para que puedas intentarlo nuevamente."
      secondaryAction={{
        label: 'Volver al evento',
        onClick: onReturnToEvent,
      }}
      primaryAction={{
        label: 'Intentar de nuevo',
        onClick: onRetry,
        loading: isRetrying,
      }}
    />
  )
}

type DeleteSubtaskSuccessProps = {
  subtaskName: string
  onReturnToEvent: () => void
}

export function DeleteSubtaskSuccess({
  subtaskName,
  onReturnToEvent,
}: DeleteSubtaskSuccessProps) {
  return (
    <OperationFeedback
      pageTitle="Tarea eliminada"
      status="success"
      title="La tarea se eliminó correctamente"
      description={`${subtaskName} fue eliminada del plan logístico. El evento se mantiene intacto.`}
      primaryAction={{
        label: 'Volver al evento',
        onClick: onReturnToEvent,
      }}
    />
  )
}

type DeleteSubtaskErrorProps = {
  subtaskName: string
  isRetrying: boolean
  onRetry: () => void
  onReturnToEvent: () => void
}

export function DeleteSubtaskError({
  subtaskName,
  isRetrying,
  onRetry,
  onReturnToEvent,
}: DeleteSubtaskErrorProps) {
  return (
    <OperationFeedback
      pageTitle="Tarea no eliminada"
      status="error"
      title="No pudimos eliminar la tarea"
      description={`Ocurrió un problema al eliminar ${subtaskName}. La tarea sigue intacta dentro del evento.`}
      secondaryAction={{
        label: 'Volver al evento',
        onClick: onReturnToEvent,
      }}
      primaryAction={{
        label: 'Intentar de nuevo',
        onClick: onRetry,
        loading: isRetrying,
      }}
    />
  )
}
