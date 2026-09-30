import { LoadErrorState } from '@/components/LoadErrorState'

type EventsErrorStateProps = {
  onRetry: () => void
}

export function EventsErrorState({
  onRetry,
}: EventsErrorStateProps) {
  return (
    <LoadErrorState
      title="No pudimos cargar tus eventos"
      description="Ocurrió un problema al cargar tus eventos. Intenta nuevamente."
      iconLabel="Error al cargar eventos"
      onRetry={onRetry}
      variant="events"
    />
  )
}
