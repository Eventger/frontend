import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { FeedbackIcon } from '@/components/feedback/FeedbackIcon'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { formatCalendarDate, getCalendarDate } from '@/lib/calendar'
import { ApiError } from '@/lib/api'
import { getSchedulingConflict, previewReschedule, saveReschedule } from '../../services/planning.service'
import type { DayPlan } from '../../types/planning.types'
import type { Subtask, UpdateSubtaskInput } from '../../types/subtask.types'

type Props = {
  task: Pick<Subtask, 'id' | 'name' | 'targetDate' | 'estimatedHours'>
  eventDate?: string
  initialInput?: UpdateSubtaskInput
  initialConflict?: DayPlan
  onClose: () => void
  onSaved: (task: Subtask) => Promise<void> | void
}

const primary = 'h-11 rounded-[10px] bg-[#4f46e5] px-5 text-white hover:bg-[#4338ca] sm:min-w-[160px]'
const secondary = 'h-11 rounded-[10px] border-[#dde2ea] px-5'
function dateLabel(date: string) {
  return formatCalendarDate(date, { weekday: 'long', day: 'numeric', month: 'long' })
}
function hoursLabel(value: string | number) {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(Number(value))
}
function previewError(error: unknown) {
  if (error instanceof ApiError && error.status === 400 && typeof error.body === 'object' && error.body && 'errors' in error.body) {
    const fields = error.body.errors
    if (typeof fields === 'object' && fields && 'target_date' in fields && Array.isArray(fields.target_date)) return String(fields.target_date[0])
  }
  return 'No pudimos consultar la carga de ese día. Inténtalo de nuevo.'
}

export function RescheduleTaskDialog({ task, eventDate, initialInput, initialConflict, onClose, onSaved }: Props) {
  const { authenticatedRequest } = useAuthenticatedApi()
  const [stage, setStage] = useState<'preview' | 'conflict' | 'resolve' | 'success'>(initialConflict ? 'conflict' : 'preview')
  const [date, setDate] = useState(initialInput?.targetDate ?? getCalendarDate(task.targetDate))
  const [hours, setHours] = useState(String(initialInput?.estimatedHours ?? task.estimatedHours))
  const [plan, setPlan] = useState<DayPlan | null>(initialConflict ?? null)
  const [conflict, setConflict] = useState<DayPlan | null>(initialConflict ?? null)
  const [option, setOption] = useState<'recommended' | 'manual' | 'reduce'>('manual')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const requestVersion = useRef(0)
  const saving = useRef(false)
  const returnFocus = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const numberHours = Number(hours)
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date)
    && Boolean(hours.trim()) && Number.isFinite(numberHours)
    && numberHours > 0 && numberHours < 100_000_000
    && Math.abs(numberHours * 100 - Math.round(numberHours * 100)) < 1e-7
  const ready = valid && !loading && plan?.date === date && Number(plan.added_hours) === numberHours && !error

  useEffect(() => {
    if (stage === 'success') return
    const requests = requestVersion
    const version = ++requestVersion.current
    const controller = new AbortController()
    if (!valid) return () => controller.abort()
    void Promise.resolve().then(async () => {
      if (controller.signal.aborted) return
      setLoading(true)
      setError('')
      try {
        const result = await previewReschedule(task.id, date, numberHours, authenticatedRequest, initialInput?.state, controller.signal)
        if (version === requestVersion.current && !controller.signal.aborted) setPlan(result)
      } catch (failure) {
        if (version === requestVersion.current && !controller.signal.aborted) setError(previewError(failure))
      } finally {
        if (version === requestVersion.current && !controller.signal.aborted) setLoading(false)
      }
    })
    return () => { controller.abort(); requests.current++ }
  }, [authenticatedRequest, date, numberHours, task.id, initialInput?.state, valid, reload, stage])

  function showConflict(result: DayPlan) {
    setConflict(result)
    setPlan(result)
    setDate(result.date)
    setHours(result.added_hours)
    setStage('conflict')
  }

  async function save() {
    if (!ready || !plan || saving.current) return
    if (plan.has_conflict) { showConflict(plan); return }
    saving.current = true
    setBusy(true)
    setError('')
    try {
      const result = await saveReschedule(task.id, date, numberHours, authenticatedRequest, initialInput)
      setPlan(result.plan)
      // La escritura ya se confirmó; una recarga fallida no debe sugerir repetirla.
      await Promise.resolve(onSaved(result.task)).catch(() => undefined)
      setStage('success')
    } catch (failure) {
      const newConflict = getSchedulingConflict(failure)
      if (newConflict) showConflict(newConflict)
      else setError('No pudimos guardar la reprogramación. Conservamos tus cambios para que puedas intentarlo de nuevo.')
    } finally {
      saving.current = false
      setBusy(false)
    }
  }

  function choose(next: typeof option) {
    if (!conflict) return
    setOption(next)
    setDate(next === 'recommended' && conflict.suggestion ? conflict.suggestion.date : conflict.date)
    setHours(conflict.added_hours)
    setError('')
  }

  const title = stage === 'preview' ? 'Reprogramar tarea' : stage === 'conflict' ? `Sobrecarga para el ${dateLabel(conflict?.date ?? date)}` : stage === 'resolve' ? 'Resolver sobrecarga' : 'Tarea reprogramada correctamente'
  const limit = plan ? hoursLabel(plan.daily_limit_hours) : ''
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
      <DialogContent showCloseButton={false} className={`max-h-[90svh] overflow-y-auto rounded-[18px] border-[#dde2ea] p-6 sm:p-7 ${stage === 'preview' ? 'sm:max-w-[640px]' : stage === 'resolve' ? 'sm:max-w-[820px]' : 'sm:max-w-[760px]'}`} onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus() }} onEscapeKeyDown={(event) => { if (busy) event.preventDefault() }} onInteractOutside={(event) => { if (busy) event.preventDefault() }}>
        <div className={stage === 'success' ? 'flex flex-col items-center py-5 text-center' : ''}>
          {stage === 'success' && <FeedbackIcon variant="success" />}
          <div className={stage === 'conflict' ? 'flex items-start gap-4' : ''}>
            {stage === 'conflict' && <span aria-hidden="true" className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#fffaeb] text-[28px] font-bold text-[#b54708]">!</span>}
            <DialogTitle className={`text-[24px] font-bold leading-8 text-[#17212b] ${stage === 'success' ? 'mt-7' : ''}`}>{title}</DialogTitle>
          </div>
          <DialogDescription className={`mt-4 text-[14px] leading-5 text-[#667085] ${stage === 'success' ? 'max-w-[500px]' : ''}`}>
            {stage === 'preview' ? `Actualmente: ${dateLabel(task.targetDate)}` : stage === 'conflict' && conflict ? `Quedarías con ${hoursLabel(conflict.planned_hours)} h planificadas (límite ${hoursLabel(conflict.daily_limit_hours)} h).` : stage === 'resolve' ? 'Selecciona una alternativa y consulta la carga antes de confirmar.' : `${initialInput?.name ?? task.name} quedó programada para el ${dateLabel(date)}. La carga de ese día es ${hoursLabel(plan?.planned_hours ?? 0)} h de ${limit} h.`}
          </DialogDescription>
        </div>

        {stage === 'preview' && <>
          <p className="mt-3 font-semibold text-[#17212b]">{task.name} · {hoursLabel(task.estimatedHours)} h</p>
          <div className="mt-6 space-y-2"><label htmlFor="reschedule-date" className="text-[13px] font-semibold">Nueva fecha</label><Input id="reschedule-date" type="date" max={plan?.event_date ?? (eventDate ? getCalendarDate(eventDate) : undefined)} value={date} disabled={busy} onChange={event => { setDate(event.target.value); setError('') }} className="h-11 rounded-[9px]" /></div>
        </>}

        {stage === 'conflict' && conflict && <>
          <div role="alert" className="mt-3 rounded-[12px] border border-[#fec84b] bg-[#fffaeb] p-4 text-[#b54708]"><p className="text-[26px] font-bold">{hoursLabel(conflict.planned_hours)} h / {hoursLabel(conflict.daily_limit_hours)} h</p><p className="mt-1 text-[13px] font-semibold">{hoursLabel(conflict.overload_hours)} h por encima de tu límite</p></div>
          <ul className="mt-3 space-y-3">{[...conflict.tasks, { id: task.id, name: `${initialInput?.name ?? task.name} (reprogramada)`, event_name: '', estimated_hours: conflict.added_hours }].map(item => <li key={item.id} className="flex min-h-16 items-center justify-between gap-4 rounded-[10px] border border-[#dde2ea] bg-[#f9fafb] p-4"><span className="min-w-0 break-words text-sm font-semibold">{item.name}{item.event_name && <span className="mt-1 block text-xs font-normal text-[#667085]">{item.event_name}</span>}</span><span className="shrink-0 text-[13px] text-[#667085]">{hoursLabel(item.estimated_hours)} h</span></li>)}</ul>
          <p className="mt-3 text-sm font-semibold">Elige una opción para resolverlo antes de confirmar.</p>
        </>}

        {stage === 'resolve' && conflict && <>
          <fieldset className="mt-3 space-y-3"><legend className="sr-only">Alternativa de resolución</legend>
            {([
              ...(conflict.suggestion ? [{ value: 'recommended' as const, title: `Mover ${task.name} al ${dateLabel(conflict.suggestion.date)}`, description: `Carga resultante: ${hoursLabel(conflict.suggestion.planned_hours)} h / ${hoursLabel(conflict.daily_limit_hours)} h` }] : []),
              { value: 'manual' as const, title: 'Elegir manualmente otro día', description: 'Consulta la carga antes de confirmar.' },
              { value: 'reduce' as const, title: 'Reducir el tiempo estimado', description: 'Úsalo solo si la estimación cambió.' },
            ]).map(item => <label key={item.value} className={`flex min-h-[105px] cursor-pointer items-start gap-3 rounded-[12px] border p-4 focus-within:ring-2 focus-within:ring-[#4f46e5] ${option === item.value ? 'border-[#4f46e5] bg-[#eef2ff]' : 'border-[#dde2ea] bg-[#f9fafb]'}`}><input type="radio" name="resolution" value={item.value} checked={option === item.value} disabled={busy} onChange={() => choose(item.value)} className="mt-1 accent-[#4f46e5]" /><span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">{item.title}</span><span className="mt-3 block text-[13px] text-[#667085]">{item.description}</span></span>{item.value === 'recommended' && <span className="shrink-0 rounded-full bg-[#eff8ff] px-2 py-1 text-[11px] font-semibold text-[#175cd3]">Recomendada</span>}</label>)}
          </fieldset>
          {option === 'manual' && <div className="mt-4 space-y-2"><label htmlFor="resolution-date" className="text-sm font-semibold">Otra fecha</label><Input id="resolution-date" type="date" max={plan?.event_date ?? conflict.event_date} value={date} disabled={busy} onChange={event => { setDate(event.target.value); setError('') }} className="h-11" /></div>}
          {option === 'reduce' && <div className="mt-4 space-y-2"><label htmlFor="resolution-hours" className="text-sm font-semibold">Horas estimadas</label><Input id="resolution-hours" type="number" min="0.01" step="0.01" max={conflict.added_hours} value={hours} disabled={busy} onChange={event => { setHours(event.target.value); setError('') }} className="h-11" /></div>}
          {!conflict.suggestion && <p className="mt-3 text-sm text-[#667085]">No encontramos un día viable en los próximos 30 días antes del evento. Elige otra fecha o revisa la estimación.</p>}
        </>}

        {(stage === 'preview' || stage === 'resolve') && <div aria-live="polite" className={`mt-5 rounded-[12px] border p-4 ${plan?.has_conflict ? 'border-[#fec84b] bg-[#fffaeb]' : 'border-[#dde2ea] bg-[#f9fafb]'}`}>
          {!valid ? <p role="alert">Selecciona una fecha e ingresa horas estimadas mayores que 0, con un máximo de dos decimales.</p> : loading ? <p role="status">Consultando la carga del día…</p> : ready && plan ? <><p className="text-sm font-semibold">Vista previa de carga</p><p className="mt-3 font-semibold">{hoursLabel(plan.existing_hours)} h existentes + {hoursLabel(plan.added_hours)} h de esta tarea = {hoursLabel(plan.planned_hours)} h</p><p className={`mt-3 text-[13px] ${plan.has_conflict ? 'text-[#b54708]' : 'text-[#027a48]'}`}>{plan.has_conflict ? `Tu límite diario es ${limit} h. La sobrecarga sería de ${hoursLabel(plan.overload_hours)} h.` : `La carga está dentro de tu límite diario de ${limit} h.`}</p></> : null}
        </div>}
        {error && <InlineFeedback>{error}{!busy && <Button type="button" variant="link" onClick={() => { setError(''); setReload(value => value + 1) }}>Volver a consultar</Button>}</InlineFeedback>}

        <div className={`mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end ${stage === 'success' ? 'sm:justify-center' : ''}`}>
          {stage !== 'success' && <Button type="button" variant="outline" disabled={busy} className={secondary} onClick={() => {
            if (stage === 'resolve' && conflict) showConflict(conflict)
            else onClose()
          }}>{stage === 'resolve' ? 'Volver' : stage === 'conflict' ? 'Cancelar reprogramación' : 'Cancelar'}</Button>}
          <Button type="button" disabled={busy || ((stage === 'preview' || stage === 'resolve') && (!ready || (stage === 'resolve' && Boolean(plan?.has_conflict))))} className={primary} onClick={() => {
            if (stage === 'success') onClose()
            else if (stage === 'conflict' && conflict) { setStage('resolve'); choose(conflict.suggestion ? 'recommended' : 'manual') }
            else void save()
          }}>{busy ? 'Guardando…' : stage === 'preview' ? 'Reprogramar' : stage === 'conflict' ? 'Resolver conflicto' : stage === 'resolve' ? 'Aplicar opción' : 'Volver al plan'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
