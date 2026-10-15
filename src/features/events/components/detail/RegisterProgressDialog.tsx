import { useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

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

type ProgressStatus = 'completed' | 'postponed'
type Stage = 'form' | 'error' | 'success'

type Props = {
  task: Subtask
  onClose: () => void
  onSaved: (task: Subtask) => Promise<void> | void
}

const primaryButton = 'h-11 rounded-[10px] bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca] sm:min-w-[190px]'
const secondaryButton = 'h-11 rounded-[10px] border-[#dde2ea] bg-white px-5 text-sm font-semibold text-[#17212b] hover:bg-[#f9fafb] sm:min-w-[150px]'

export function RegisterProgressDialog({ task, onClose, onSaved }: Props) {
  const { authenticatedRequest } = useAuthenticatedApi()
  const [status, setStatus] = useState<ProgressStatus>(task.state === 'postponed' ? 'postponed' : 'completed')
  const [note, setNote] = useState(task.details ?? '')
  const [stage, setStage] = useState<Stage>('form')
  const [busy, setBusy] = useState(false)

  const dateLabel = formatCalendarDate(task.targetDate, { day: 'numeric', month: 'short' })
  const taskMeta = `${task.name} · ${dateLabel} · ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(task.estimatedHours)} h`

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
        if (!open && !busy && stage !== 'error') onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl border-[#dde2ea] bg-white p-7 sm:max-w-[640px]"
        onEscapeKeyDown={(event) => {
          if (busy || stage === 'error') event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (busy || stage === 'error') event.preventDefault()
        }}
      >
        {stage === 'form' && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle className="text-[22px] font-bold leading-7 text-[#17212b]">Registrar avance</DialogTitle>
                <DialogDescription className="mt-2 break-words text-sm leading-5 text-[#667085]">Actualiza el estado de esta tarea.</DialogDescription>
              </div>
              <button type="button" aria-label="Cerrar" onClick={onClose} disabled={busy} className="-mr-2 -mt-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-[#667085] hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:opacity-50">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <p className="mt-5 break-words text-sm font-semibold text-[#17212b]">{taskMeta}</p>

            <fieldset className="mt-7">
              <legend className="mb-3 text-sm font-semibold text-[#17212b]">Estado</legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-pressed={status === 'completed'}
                  onClick={() => setStatus('completed')}
                  disabled={busy}
                  className={`flex min-h-14 items-center justify-center rounded-[10px] border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] ${status === 'completed' ? 'border-[#4f46e5] bg-[#eef2ff] text-[#3730a3]' : 'border-[#dde2ea] bg-white text-[#344054] hover:bg-[#f9fafb]'}`}
                >Hecha</button>
                <button
                  type="button"
                  aria-pressed={status === 'postponed'}
                  onClick={() => setStatus('postponed')}
                  disabled={busy}
                  className={`flex min-h-14 items-center justify-center rounded-[10px] border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] ${status === 'postponed' ? 'border-[#4f46e5] bg-[#eef2ff] text-[#3730a3]' : 'border-[#dde2ea] bg-white text-[#344054] hover:bg-[#f9fafb]'}`}
                >Pospuesta</button>
              </div>
            </fieldset>

            {status === 'postponed' && (
              <div className="mt-5">
                <label htmlFor={`progress-note-${task.id}`} className="mb-2 block text-sm font-semibold text-[#17212b]">Nota (opcional)</label>
                <Textarea
                  id={`progress-note-${task.id}`}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={busy}
                  placeholder="Escribe una nota sobre el cambio…"
                  className="min-h-[104px] resize-y rounded-[10px] border-[#dde2ea] text-sm leading-5 placeholder:text-[#98a2b3] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/20"
                />
                <p className="mt-2 text-xs leading-5 text-[#667085]">La nota se conservará si ocurre un error.</p>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={busy} onClick={onClose} className={secondaryButton}>Cancelar</Button>
              <Button type="button" disabled={busy} onClick={() => void saveProgress()} className={primaryButton}>{busy ? 'Guardando…' : 'Guardar cambio'}</Button>
            </div>
          </>
        )}

        {stage === 'error' && (
          <div className="flex min-h-[350px] flex-col items-center justify-center py-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#fef3f2] text-[#b42318]" aria-hidden="true"><AlertCircle size={34} /></span>
            <DialogTitle className="mt-7 text-[24px] font-bold leading-8 text-[#17212b]">Cambio no guardado</DialogTitle>
            <DialogDescription className="mt-5 max-w-[540px] text-[15px] leading-[22px] text-[#667085]">No pudimos actualizar la tarea. Ocurrió un problema al guardar el avance. Conservamos la información que ingresaste para que puedas intentarlo nuevamente.</DialogDescription>
            <Button type="button" onClick={() => setStage('form')} className={`${primaryButton} mt-10`}>Volver al evento</Button>
          </div>
        )}

        {stage === 'success' && (
          <div className="flex min-h-[350px] flex-col items-center justify-center py-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#ecfdf3] text-[#027a48]" aria-hidden="true"><CheckCircle2 size={34} /></span>
            <DialogTitle className="mt-7 text-[24px] font-bold leading-8 text-[#17212b]">Avance registrado</DialogTitle>
            <DialogDescription className="mt-5 max-w-[540px] text-[15px] leading-[22px] text-[#667085]">
              {status === 'completed'
                ? `La tarea se actualizó correctamente. “${task.name}” fue marcada como hecha. El progreso del evento se actualizó.`
                : `“${task.name}” fue marcada como pospuesta y la nota fue guardada.`}
            </DialogDescription>
            <Button type="button" onClick={onClose} className={`${primaryButton} mt-10`}>Volver al evento</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}