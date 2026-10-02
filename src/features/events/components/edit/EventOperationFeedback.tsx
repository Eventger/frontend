import { OperationFeedback } from '@/components/OperationFeedback'

export function EditEventSuccess({
  eventName,
  onContinueEditing,
  onReturnToEvent,
}: {
  eventName: string
  onContinueEditing: () => void
  onReturnToEvent: () => void
}) {
  return (
    <OperationFeedback
      pageTitle="Evento actualizado"
      status="success"
      title="Los cambios se guardaron correctamente"
      description={`La información y las tareas de ${eventName} se actualizaron correctamente.`}
      secondaryAction={{
        label: 'Volver a editar',
        onClick:
          onContinueEditing,
      }}
      primaryAction={{
        label: 'Volver al evento',
        onClick:
          onReturnToEvent,
      }}
    />
  )
}

export function EditEventError({
  isRetrying,
  onRetry,
  onReturnToEvent,
}: {
  isRetrying: boolean
  onRetry: () => void
  onReturnToEvent: () => void
}) {
  return (
    <OperationFeedback
      pageTitle="Cambios no guardados"
      status="error"
      title="No pudimos actualizar el evento"
      description="Ocurrió un problema al guardar los cambios. Conservamos la información y las tareas que editaste para que puedas intentarlo nuevamente."
      secondaryAction={{
        label: 'Volver y revisar',
        onClick:
          onReturnToEvent,
      }}
      primaryAction={{
        label: 'Intentar de nuevo',
        onClick: onRetry,
        loading: isRetrying,
      }}
    />
  )
}

export function DeleteEventSuccess({
  eventName,
  onGoEvents,
}: {
  eventName: string
  onGoEvents: () => void
}) {
  return (
    <OperationFeedback
      pageTitle="Evento eliminado"
      status="success"
      title="El evento se eliminó correctamente"
      description={`${eventName} y todas sus tareas fueron eliminados de tu planificación.`}
      primaryAction={{
        label: 'Volver a eventos',
        onClick: onGoEvents,
      }}
    />
  )
}

export function DeleteEventError({
  eventName,
  isRetrying,
  onRetry,
  onReturnToEvent,
}: {
  eventName: string
  isRetrying: boolean
  onRetry: () => void
  onReturnToEvent: () => void
}) {
  return (
    <OperationFeedback
      pageTitle="No se pudo eliminar"
      status="error"
      title="No pudimos eliminar el evento"
      description={`Ocurrió un problema al eliminar ${eventName}. El evento y todas sus tareas siguen intactos.`}
      secondaryAction={{
        label: 'Volver al evento',
        onClick:
          onReturnToEvent,
      }}
      primaryAction={{
        label: 'Intentar de nuevo',
        onClick: onRetry,
        loading: isRetrying,
      }}
    />
  )
}
