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

type FeedbackProps = {
  pageTitle: string
  status: 'success' | 'error'
  title: string
  description: string
  primaryAction: FeedbackAction
  secondaryAction?: FeedbackAction
}

function EventOperationFeedback({
  pageTitle,
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
}: FeedbackProps) {
  const success =
    status === 'success'

  return (
    <>
      <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
        {pageTitle}
      </h1>

      <section className="mx-auto mt-10 flex min-h-[430px] w-full max-w-[760px] flex-col items-center rounded-[18px] border border-[#dde2ea] bg-white px-6 py-12 text-center md:mt-[135px]">
        <div
          className={
            success
              ? 'flex size-16 items-center justify-center rounded-full bg-[#ecfdf3]'
              : 'flex size-16 items-center justify-center rounded-full bg-[#feeeec]'
          }
        >
          {success ? (
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
              onClick={
                secondaryAction.onClick
              }
              disabled={
                secondaryAction.loading
              }
              className="h-11 rounded-[10px] sm:w-[180px]"
            >
              {
                secondaryAction.label
              }
            </Button>
          )}

          <Button
            type="button"
            onClick={
              primaryAction.onClick
            }
            disabled={
              primaryAction.loading
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
    <EventOperationFeedback
      pageTitle="Evento actualizado"
      status="success"
      title="Los cambios se guardaron correctamente"
      description={`La información de ${eventName} fue actualizada. Tus tareas y progreso se mantienen.`}
      secondaryAction={{
        label: 'Seguir editando',
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
    <EventOperationFeedback
      pageTitle="Cambios no guardados"
      status="error"
      title="No pudimos actualizar el evento"
      description="Ocurrió un problema al guardar los cambios. Conservamos la información que ingresaste para que puedas intentarlo nuevamente."
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

export function DeleteEventSuccess({
  eventName,
  onGoEvents,
}: {
  eventName: string
  onGoEvents: () => void
}) {
  return (
    <EventOperationFeedback
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
    <EventOperationFeedback
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