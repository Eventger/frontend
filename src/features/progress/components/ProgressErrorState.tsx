import { LoadErrorState } from '@/components/LoadErrorState'

interface ProgressErrorStateProps {
  onRetry: () => void
  isRetrying?: boolean
}

export function ProgressErrorState({ onRetry, isRetrying = false }: ProgressErrorStateProps) {
  return (
    <LoadErrorState
      title="No pudimos cargar el progreso"
      description="Ocurrió un problema al calcular el avance de tus actividades."
      iconLabel="Error al cargar el progreso"
      onRetry={onRetry}
      actionLabel={isRetrying ? 'Reintentando…' : 'Reintentar'}
      isActionDisabled={isRetrying}
      variant="embedded"
    />
  )
}
