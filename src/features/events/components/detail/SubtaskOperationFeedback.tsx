import {
  Check,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

type FeedbackAction = {
  label: string
  onClick: () => void
  loading?: boolean
}

type SubtaskOperationFeedbackProps = {
  pageTitle: string
  status: 'success' | 'error'
  title: string
  description: string
  primaryAction: FeedbackAction
  secondaryAction?: FeedbackAction
}

function SubtaskOperationFeedback({
  pageTitle,
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
}: SubtaskOperationFeedbackProps) {
  const isSuccess =
    status === 'success'

  return (
    <>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        {pageTitle}
      </h1>

      <section className="mx-auto mt-10 flex min-h-[430px] w-full max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-6 py-12 text-center md:mt-[135px]">
        <div
          className={
            isSuccess
              ? 'flex size-16 items-center justify-center rounded-full bg-[#ecfdf3]'
              : 'flex size-16 items-center justify-center rounded-full bg-[#feeeec]'
          }
        >
          {isSuccess ? (
            <Check
              aria-label="Operación completada"
              className="size-8 text-[#027a48]"
              strokeWidth={3}
            />
          ) : (
            <X
              aria-label="Error en la operación"
              className="size-8 text-[#b42318]"
              strokeWidth={3}
            />
          )}
        </div>

        <h2 className="mt-7 max-w-[530px] text-[24px] font-bold text-[#17212b]">
          {title}
        </h2>

        <p className="mt-4 max-w-[540px] text-[15px] leading-6 text-[#667085]">
          {description}
        </p>

        <div className="mt-10 flex w-full flex-col-reverse justify-center gap-3 sm:flex-row">
          {secondaryAction && (
            <Button
              type="button"
              variant="outline"
              disabled={
                secondaryAction.loading
              }
              onClick={
                secondaryAction.onClick
              }
              className="h-11 rounded-[10px] sm:w-[180px]"
            >
              {secondaryAction.label}
            </Button>
          )}

          <Button
            type="button"
            disabled={
              primaryAction.loading
            }
            onClick={
              primaryAction.onClick
            }
            className="h-11 rounded-[10px] bg-[#4f46e5] text-white hover:bg-[#4338ca] sm:w-[190px]"
          >
            {primaryAction.loading
              ? 'Procesando...'
              : primaryAction.label}
          </Button>
        </div>
      </section>
    </>
  )
}

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
    <SubtaskOperationFeedback
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
    <SubtaskOperationFeedback
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
    <SubtaskOperationFeedback
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
    <SubtaskOperationFeedback
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