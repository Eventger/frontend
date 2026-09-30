import { LoadErrorState } from '@/components/LoadErrorState'

type EventDetailErrorStateProps = {
  onRetry: () => void
}

export function EventDetailErrorState({
  onRetry,
}: EventDetailErrorStateProps) {
  return (
    <LoadErrorState
      title="No pudimos cargar el evento"
      description="Ocurrió un problema al cargar el detalle del evento. Intenta nuevamente."
      iconLabel="Error al cargar el evento"
      onRetry={onRetry}
      variant="events"
    />
  )
}
