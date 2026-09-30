import { OperationFeedback } from '@/components/OperationFeedback'

import type { Subtask } from '@/features/events/types/subtask.types'

type CreateSubtaskSuccessProps = {
  subtask: Subtask
  eventName: string
  onAddAnother: () => void
  onReturnToEvent: () => void
}

export function CreateSubtaskSuccess({
  subtask,
  eventName,
  onAddAnother,
  onReturnToEvent,
}: CreateSubtaskSuccessProps) {
  return (
    <OperationFeedback
      pageTitle="Tarea agregada"
      status="success"
      title={`${subtask.name} se agregó correctamente`}
      description={`La tarea ya hace parte del plan logístico de ${eventName}.`}
      primaryAction={{
        label: 'Volver al evento',
        onClick: onReturnToEvent,
      }}
      secondaryAction={{
        label: 'Agregar otra tarea',
        onClick: onAddAnother,
      }}
    />
  )
}
