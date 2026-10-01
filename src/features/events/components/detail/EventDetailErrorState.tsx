import { LoadErrorState } from '@/components/LoadErrorState'

type EventDetailErrorStateProps = {
  onRetry: () => void
  title?: string
  description?: string
}

export function EventDetailErrorState({
  onRetry,
  title = 'No pudimos cargar el evento',
  description = 'Ocurrió un problema al cargar el detalle del evento. Intenta nuevamente.',
}: EventDetailErrorStateProps) {
  return (
    <LoadErrorState
      title={title}
      description={description}
      iconLabel="Error al cargar el evento"
      onRetry={onRetry}
      variant="events"
    />
  )
}
