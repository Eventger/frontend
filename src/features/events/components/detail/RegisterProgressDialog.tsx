import { useState } from 'react'
import { AlertCircle, Calendar, CheckCircle2, Clock, Clock3, FileText, ListTodo, Pause } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { formatCalendarDate } from '@/lib/calendar'
import { registerSubtaskProgress } from '@/features/events/services/subtasks.service'
import type { Subtask } from '@/features/events/types/subtask.types'

type ProgressStatus = Subtask['state']
type Stage = 'form' | 'error' | 'success'

type Props = {
  task: Subtask
  onClose: () => void
  onSaved: (task: Subtask) => Promise<void> | void
}

const primaryButton = 'h-11 rounded-lg bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca] sm:min-w-[190px]'
const secondaryButton = 'h-11 rounded-lg border-[#dde2ea] bg-white px-5 text-sm font-semibold text-[#17212b] hover:bg-[#f9fafb] sm:min-w-[150px]'

export function RegisterProgressDialog({ task, onClose, onSaved }: Props) {
  const { authenticatedRequest } = useAuthenticatedApi()
  const [status, setStatus] = useState<ProgressStatus>(task.state)
  const [note, setNote] = useState(task.details ?? '')
  const [stage, setStage] = useState<Stage>('form')
  const [busy, setBusy] = useState(false)

  const dateLabel = formatCalendarDate(task.targetDate, { day: 'numeric', month: 'short' })
  const formattedDate = formatCalendarDate(task.targetDate, { day: 'numeric', month: 'short', year: 'numeric' })
  const hoursLabel = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(task.estimatedHours)
  const taskMeta = `${task.name} · ${dateLabel} · ${hoursLabel} h`

  async function saveProgress() {
    if (busy) return
    setBusy(true)
    try {
      const updated = await registerSubtaskProgress(task.id, status, note, authenticatedRequest)
      setStage('success')
      // La actualización ya se guardó: un fallo de recarga no debe presentarse como fallo del guardado.
      await Promise.resolve().then(() => onSaved(updated)).catch(() => undefined)
    } catch {
      // El estado y la nota siguen en el componente para que el usuario pueda reintentar.
      setStage('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl border-[#dde2ea] bg-white p-5 sm:max-w-[840px] sm:p-6"
        onEscapeKeyDown={(event) => {
          if (busy || stage === 'error') event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (busy || stage === 'error') event.preventDefault()
        }}
      >
        {stage === 'form' && (
          <>
            <div className="flex items-start justify-center gap-4 text-center">
              <div className="min-w-0">
                <DialogTitle className="type-dialog-title text-[#17212b]">Registrar avance</DialogTitle>
                <DialogDescription className="type-body mt-1.5 break-words text-[#667085]">
                  Actualiza el estado de esta tarea.
                </DialogDescription>
              </div>
            </div>

            {/* Tarjeta resumen de la tarea */}
            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border-subtle bg-[#f8fafc] p-3">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]"
                aria-hidden="true"
              >
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-5 text-[#101828] sm:text-sm">
                  {task.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] leading-4 text-[#667085]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3 shrink-0 text-[#667085]" aria-hidden="true" />
                    <span>{formattedDate}</span>
                  </span>
                  <span className="text-[#d0d5dd]" aria-hidden="true">|</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3 shrink-0 text-[#667085]" aria-hidden="true" />
                    <span>{hoursLabel} h</span>
                  </span>
                </div>
              </div>
              <span className="sr-only">{taskMeta}</span>
            </div>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-[#101828] sm:text-base">
                ¿Qué pasó con esta tarea?
              </legend>
              <div className="mt-2 grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  role="button"
                  aria-pressed={status === 'pending'}
                  aria-label="Pendiente"
                  aria-description="Aún falta por realizar"
                  onClick={() => setStatus('pending')}
                  disabled={busy}
                  className={`group relative flex h-[78px] w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] ${status === 'pending'
                      ? 'border-2 border-[#4f46e5] bg-[#f8f9ff]'
                      : 'border-2 border-[#eaecf0] bg-white hover:bg-[#f9fafb]'
                    }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors ${status === 'pending'
                        ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-xs'
                        : 'border-[#eaecf0] bg-[#f9fafb] text-[#667085]'
                      }`}
                    aria-hidden="true"
                  >
                    <ListTodo className={`size-5 ${status === 'pending' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold leading-5 ${status === 'pending' ? 'text-[#3538cd]' : 'text-[#101828]'}`}>
                      Pendiente
                    </span>
                    <span className="mt-0.5 block text-xs leading-4 text-[#344054]">
                      Aún falta por realizar
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  role="button"
                  aria-pressed={status === 'in_progress'}
                  aria-label="En progreso"
                  aria-description="La tarea se está realizando"
                  onClick={() => setStatus('in_progress')}
                  disabled={busy}
                  className={`group relative flex h-[78px] w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] ${status === 'in_progress'
                      ? 'border-2 border-[#4f46e5] bg-[#f8f9ff]'
                      : 'border-2 border-[#eaecf0] bg-white hover:bg-[#f9fafb]'
                    }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors ${status === 'in_progress'
                        ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-xs'
                        : 'border-[#eaecf0] bg-[#f9fafb] text-[#475467]'
                      }`}
                    aria-hidden="true"
                  >
                    <Clock3 className={`size-5 ${status === 'in_progress' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold leading-5 ${status === 'in_progress' ? 'text-[#3538cd]' : 'text-[#101828]'}`}>
                      En progreso
                    </span>
                    <span className="mt-0.5 block text-xs leading-4 text-[#344054]">
                      La tarea se está realizando
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  role="button"
                  aria-pressed={status === 'completed'}
                    aria-label="Completada"
                  aria-description="La tarea se completó"
                  onClick={() => setStatus('completed')}
                  disabled={busy}
                  className={`group relative flex h-[78px] w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] ${status === 'completed'
                      ? 'border-2 border-[#4f46e5] bg-[#f8f9ff]'
                      : 'border-2 border-[#eaecf0] bg-white hover:bg-[#f9fafb]'
                    }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors ${status === 'completed'
                        ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-xs'
                        : 'border-[#eaecf0] bg-[#f9fafb] text-[#475467]'
                      }`}
                    aria-hidden="true"
                  >
                    <CheckCircle2 className={`size-5 ${status === 'completed' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-semibold leading-5 ${status === 'completed' ? 'text-[#3538cd]' : 'text-[#101828]'
                        }`}
                    >
                      Completada
                    </span>
                    <span className="mt-0.5 block text-xs leading-4 text-[#344054]">
                      La tarea se completó
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  role="button"
                  aria-pressed={status === 'postponed'}
                  aria-label="Pospuesta"
                  aria-description="No se puede realizar por ahora"
                  onClick={() => setStatus('postponed')}
                  disabled={busy}
                  className={`group relative flex h-[78px] w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] ${status === 'postponed'
                      ? 'border-2 border-[#4f46e5] bg-[#f8f9ff]'
                      : 'border-2 border-[#eaecf0] bg-white hover:bg-[#f9fafb]'
                    }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors ${status === 'postponed'
                        ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-xs'
                        : 'border-[#eaecf0] bg-[#f9fafb] text-[#344054]'
                      }`}
                    aria-hidden="true"
                  >
                    <Pause className={`size-5 ${status === 'postponed' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-semibold leading-5 ${status === 'postponed' ? 'text-[#3538cd]' : 'text-[#101828]'
                        }`}
                    >
                      Pospuesta
                    </span>
                    <span className="mt-0.5 block text-xs leading-4 text-[#344054]">
                      No se puede realizar por ahora
                    </span>
                  </div>
                </button>
              </div>
            </fieldset>

            <p className="mt-3 text-xs text-[#344054]">
              Puedes actualizar el estado nuevamente cuando sea necesario.
            </p>

            <div className="mt-3">
              <label htmlFor={`progress-note-${task.id}`} className="type-label mb-2 block font-semibold text-[#101828]">Nota (opcional)</label>
              <Textarea
                id={`progress-note-${task.id}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={busy}
                placeholder="Escribe una nota sobre el cambio…"
                className="min-h-[72px] resize-y rounded-xl border-[#dde2ea] text-sm leading-5 placeholder:text-[#98a2b3] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/20"
              />
              <p className="mt-1.5 text-xs leading-5 text-[#667085]">La nota se conservará si ocurre un error.</p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button type="button" variant="outline" disabled={busy} onClick={onClose} className={secondaryButton}>Cancelar</Button>
              <Button type="button" disabled={busy} onClick={() => void saveProgress()} className={primaryButton}>{busy ? 'Guardando…' : 'Guardar cambio'}</Button>
            </div>
          </>
        )}

        {stage === 'error' && (
          <div className="flex min-h-[350px] flex-col items-center justify-center py-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#fef3f2] text-[#b42318]" aria-hidden="true"><AlertCircle size={34} /></span>
            <DialogTitle className="type-dialog-title mt-7 text-[#17212b]">Cambio no guardado</DialogTitle>
            <DialogDescription className="type-body mt-5 max-w-[540px] text-[#667085]">No pudimos actualizar la tarea. Ocurrió un problema al guardar el avance. Conservamos la información que ingresaste para que puedas intentarlo nuevamente.</DialogDescription>
            <Button type="button" onClick={() => setStage('form')} className={`${primaryButton} mt-10`}>Volver a intentar</Button>
          </div>
        )}

        {stage === 'success' && (
          <div className="flex min-h-[350px] flex-col items-center justify-center py-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#ecfdf3] text-[#027a48]" aria-hidden="true"><CheckCircle2 size={34} /></span>
            <DialogTitle className="type-dialog-title mt-7 text-[#17212b]">Avance registrado</DialogTitle>
            <DialogDescription className="type-body mt-5 max-w-[540px] text-[#667085]">
              {status === 'completed'
                ? `La tarea se actualizó correctamente. “${task.name}” fue marcada como completada. El progreso del evento se actualizó.`
                : status === 'in_progress'
                  ? `“${task.name}” fue marcada como en progreso.`
                  : status === 'pending'
                    ? `“${task.name}” fue marcada como pendiente.`
                    : `“${task.name}” fue marcada como pospuesta y la nota fue guardada.`}
            </DialogDescription>
            <Button type="button" onClick={onClose} className={`${primaryButton} mt-10`}>Volver al evento</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
