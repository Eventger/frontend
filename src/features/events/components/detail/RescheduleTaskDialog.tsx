import { useEffect, useRef, useState } from 'react'
import { CalendarDays, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { FeedbackIcon } from '@/components/feedback/FeedbackIcon'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { formatCalendarDate, getCalendarDate } from '@/lib/calendar'
import { getApiFieldError } from '@/lib/api'
import { formatHoursDuration } from '@/lib/duration'
import { getEventById } from '../../services/event.service'
import { getSchedulingConflict, previewReschedule, saveReschedule } from '../../services/planning.service'
import type { DayPlan } from '../../types/planning.types'
import type { Subtask, UpdateSubtaskInput } from '../../types/subtask.types'

type Props = {
  task: Pick<Subtask, 'id' | 'eventId' | 'name' | 'targetDate' | 'estimatedHours'>
  eventDate?: string
  initialInput?: UpdateSubtaskInput
  initialConflict?: DayPlan
  getFocusFallback?: () => HTMLElement | null
  preferFocusFallback?: boolean
  onClose: () => void
  onSaved: (task: Subtask) => Promise<void> | void
}

const primary = 'h-11 rounded-[10px] bg-[#4f46e5] px-5 text-white transition-none hover:bg-[#4f46e5] sm:min-w-[160px]'
const secondary = 'h-11 rounded-[10px] border-[#dde2ea] px-5'
function dateLabel(date: string) {
  return formatCalendarDate(date, { weekday: 'long', day: 'numeric', month: 'long' })
}
const hoursLabel = formatHoursDuration
function previewError(error: unknown) {
  const message = getApiFieldError(error, 'target_date')
  if (message) return message
  return 'No pudimos consultar la carga de ese día. Inténtalo de nuevo.'
}

export function RescheduleTaskDialog({ task, eventDate, initialInput, initialConflict, getFocusFallback, preferFocusFallback = false, onClose, onSaved }: Props) {
  const { authenticatedRequest } = useAuthenticatedApi()
  const [taskEventDate, setTaskEventDate] = useState<string>()
  const [stage, setStage] = useState<'preview' | 'conflict' | 'resolve' | 'confirm' | 'success'>(initialConflict ? 'conflict' : 'preview')
  const today = getCalendarDate(new Date())
  const [date, setDate] = useState(() => {
    return initialConflict ? (initialInput?.targetDate ?? getCalendarDate(task.targetDate)) : ''
  })
  const [hours, setHours] = useState(String(initialInput?.estimatedHours ?? task.estimatedHours))
  const [durationInput, setDurationInput] = useState<{ hours: string; minutes: string } | null>(null)
  const [plan, setPlan] = useState<DayPlan | null>(initialConflict ?? null)
  const [conflict, setConflict] = useState<DayPlan | null>(initialConflict ?? null)
  const [option, setOption] = useState<'recommended' | 'manual' | 'reduce'>('manual')
  const [hasOpenedResolution, setHasOpenedResolution] = useState(false)
  const [canReturnToPreview, setCanReturnToPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const requestVersion = useRef(0)
  const saving = useRef(false)
  const returnFocus = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const editingDuration = (stage === 'resolve' || stage === 'confirm') && option === 'reduce' && durationInput !== null
  const validDuration = !editingDuration || (/^\d+$/.test(durationInput.hours)
    && /^\d+$/.test(durationInput.minutes) && Number(durationInput.minutes) < 60)
  const numberHours = editingDuration
    ? Number((Number(durationInput.hours) + Number(durationInput.minutes) / 60).toFixed(2))
    : Number(hours)
  const associatedEventDate = plan?.event_date ?? eventDate ?? taskEventDate
  const eventDateLimit = associatedEventDate ? getCalendarDate(associatedEventDate) : undefined
  const dateAfterEvent = Boolean(eventDateLimit && /^\d{4}-\d{2}-\d{2}$/.test(date) && date > eventDateLimit)
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date)
    && date >= today
    && !dateAfterEvent
    && validDuration && Boolean(hours.trim()) && Number.isFinite(numberHours)
    && numberHours > 0 && numberHours < 100_000_000
    && Math.abs(numberHours * 100 - Math.round(numberHours * 100)) < 1e-7
  const hasMatchingPlan = valid && plan?.date === date && Number(plan.added_hours) === numberHours
  const ready = hasMatchingPlan && !loading && !error

  useEffect(() => {
    if (eventDate) return
    let active = true
    void getEventById(task.eventId, authenticatedRequest)
      .then(event => { if (active) setTaskEventDate(event.eventDate) })
      .catch(() => undefined)
    return () => { active = false }
  }, [authenticatedRequest, eventDate, task.eventId])

  useEffect(() => {
    if (stage === 'success' || stage === 'confirm') return
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
    setCanReturnToPreview(true)
    setHasOpenedResolution(false)
    setDate(result.date)
    setHours(result.added_hours)
    setDurationInput(null)
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
      setStage('success')
      setBusy(false)
      // La escritura ya se confirmó; una recarga fallida no debe sugerir repetirla.
      await Promise.resolve().then(() => onSaved(result.task)).catch(() => undefined)
    } catch (failure) {
      const newConflict = getSchedulingConflict(failure)
      if (newConflict) showConflict(newConflict)
      else setError(getApiFieldError(failure, 'target_date') ?? 'No pudimos guardar la reprogramación. Conservamos tus cambios para que puedas intentarlo de nuevo.')
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
    const minutes = Math.round(Number(conflict.added_hours) * 60)
    setDurationInput(next === 'reduce' ? { hours: String(Math.floor(minutes / 60)), minutes: String(minutes % 60) } : null)
    setError('')
  }

  const originalWholeHours = Math.ceil(Number(conflict?.added_hours ?? task.estimatedHours))
  const hourOptions = Array.from({ length: Math.min(24, originalWholeHours) + 1 }, (_, index) => index)
  if (originalWholeHours > 24) hourOptions.push(originalWholeHours)
  const title = stage === 'preview' ? 'Reprogramar tarea' : stage === 'conflict' || stage === 'resolve' ? `Sobrecarga para el ${dateLabel(conflict?.date ?? date)}` : stage === 'confirm' ? '¿Estás seguro?' : 'Tarea reprogramada correctamente'
  const limit = plan ? hoursLabel(plan.daily_limit_hours) : ''
  const loadPreview = <div aria-live="polite" aria-busy={loading} className={`${stage === 'preview' ? 'mt-8' : 'mt-4'} min-h-[156px] rounded-[12px] border p-3 sm:p-4 ${hasMatchingPlan && plan?.has_conflict ? 'border-[#fec84b] bg-[#fffaeb]' : 'border-[#dde2ea] bg-[#f9fafb]'}`}>
    {!date ? <div className="flex min-h-[122px] flex-col items-center justify-center text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]" aria-hidden="true"><CalendarDays size={20} /></span>
      <p className="mt-2 text-sm font-semibold text-[#17212b]">Elige una fecha</p>
      <p className="mt-1 max-w-[280px] text-[13px] leading-5 text-[#667085]">Aquí verás la carga del día antes de reprogramar.</p>
    </div> : !valid ? <p role="alert">{date < today ? 'No puedes reprogramar una tarea para una fecha anterior a hoy.' : dateAfterEvent ? 'La fecha límite no puede ser posterior a la fecha del evento.' : 'Selecciona una fecha e ingresa una duración mayor que cero, con horas enteras y minutos entre 0 y 59.'}</p> : loading && !hasMatchingPlan ? <p role="status">Consultando la carga del día…</p> : hasMatchingPlan && plan ? <><p className="text-sm font-semibold">Vista previa de carga</p><dl className="mt-3 grid grid-cols-3 gap-3">
      {[{ label: 'Existentes', value: plan.existing_hours }, { label: 'Esta tarea', value: plan.added_hours }, { label: 'Total previsto', value: plan.planned_hours }].map(item => <div key={item.label} className="min-w-0"><dt className="text-xs text-[#667085]">{item.label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums text-[#17212b]">{hoursLabel(item.value)}</dd></div>)}
    </dl><p className={`mt-3 border-t border-[#dde2ea] pt-3 text-[13px] ${plan.has_conflict ? 'text-[#b54708]' : 'text-[#027a48]'}`}>{plan.has_conflict ? `Tu límite diario es ${limit}. La sobrecarga sería de ${hoursLabel(plan.overload_hours)}.` : `La carga está dentro de tu límite diario de ${limit}.`}</p></> : null}
  </div>
  const errorFeedback = error && <InlineFeedback>{error}{!busy && <Button type="button" variant="link" onClick={() => { setError(''); if (stage === 'confirm') setStage('resolve'); setReload(value => value + 1) }}>Volver a consultar</Button>}</InlineFeedback>
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(640px,90svh)] flex-col gap-0 overflow-hidden rounded-[18px] border-[#dde2ea] p-5 sm:max-w-[640px] sm:p-7"
        onCloseAutoFocus={event => {
          event.preventDefault()
          const fallback = getFocusFallback?.()
          const target = preferFocusFallback
            ? fallback
            : returnFocus.current?.isConnected ? returnFocus.current : fallback
          target?.focus({ preventScroll: true })
        }}
        onEscapeKeyDown={event => { if (busy) event.preventDefault() }}
        onInteractOutside={event => { if (busy) event.preventDefault() }}
      >
        <div className={stage === 'success' || stage === 'confirm' ? 'min-h-0 flex-1 overflow-y-auto text-center' : 'shrink-0'}>
          <div className={stage === 'success' || stage === 'confirm' ? 'flex min-h-full flex-col items-center justify-center py-4' : ''}>
          {stage === 'success' && <FeedbackIcon variant="success" />}
          <div className={stage === 'confirm' ? 'flex items-center gap-3' : stage !== 'success' ? 'pr-10' : ''}>
            {stage === 'confirm' && <FeedbackIcon variant="warning" size="small" />}
            <DialogTitle className={`min-w-0 text-[22px] font-bold leading-7 text-[#17212b] sm:text-[24px] sm:leading-8 ${stage === 'success' ? 'mt-7' : ''}`}>{title}</DialogTitle>
          </div>
          <div className={stage === 'preview' ? 'mt-4 rounded-[12px] border border-[#dde2ea] bg-[#f9fafb] p-4' : ''}>
          {stage === 'preview' && <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words text-sm font-semibold leading-5 text-[#17212b]">{task.name}</p>
            <span className="shrink-0 rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold tabular-nums text-[#3730a3]">{hoursLabel(task.estimatedHours)}</span>
          </div>}
          <DialogDescription className={`${stage === 'preview' ? 'mt-2' : 'mt-4'} text-[14px] leading-5 text-[#667085] ${stage === 'success' || stage === 'confirm' ? 'mx-auto max-w-[500px]' : ''}`}>
            {stage === 'preview' ? <><span className="block">Actualmente: {dateLabel(task.targetDate)}</span>{associatedEventDate && <span className="mt-1 block">Fecha del evento: {formatCalendarDate(associatedEventDate, { day: 'numeric', month: 'long', year: 'numeric' })}</span>}</> : stage === 'conflict' || stage === 'resolve' ? 'Revisa la sobrecarga y elige cómo ajustar la fecha.' : stage === 'confirm' ? <><span className="block">¿Seguro que quieres reprogramar la subtarea?</span><span className="mt-2 block">Quedarías con {hoursLabel(plan?.planned_hours ?? 0)} para ese día (tu límite es {limit}).</span><span className="mt-3 block text-xs">{dateLabel(date)} · {hoursLabel(numberHours)}</span></> : `${initialInput?.name ?? task.name} quedó programada para el ${dateLabel(date)}. La carga de ese día es ${hoursLabel(plan?.planned_hours ?? 0)} de ${limit}.`}
          </DialogDescription>
          {stage === 'confirm' && errorFeedback}
          </div>
          </div>
        </div>

        {stage !== 'success' && stage !== 'confirm' && <div className="reschedule-dialog-scroll-region min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4">
        {stage === 'preview' && <>
          <div className="space-y-2"><label htmlFor="reschedule-date" className="text-[13px] font-semibold text-[#17212b]">Nueva fecha</label><Input id="reschedule-date" type="date" min={today} max={eventDateLimit} value={date} disabled={busy} onChange={event => { setDate(event.target.value); setError('') }} className="h-11 rounded-[9px]" /></div>
        </>}

        {stage === 'conflict' && conflict && <>
          <div role="alert" className="rounded-[12px] border border-[#fec84b] bg-[#fffaeb] p-3 text-[#b54708] sm:p-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[26px] font-bold">{hoursLabel(conflict.planned_hours)} / {hoursLabel(conflict.daily_limit_hours)}</p><p className="mt-1 text-[13px] font-semibold">{hoursLabel(conflict.overload_hours)} por encima de tu límite</p></div><span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/60 text-[24px] font-bold text-[#b54708]">!</span></div></div>
          <ul aria-label="Tareas que forman la carga del día" className="mt-3 max-h-[min(34svh,280px)] space-y-2 overflow-y-auto overscroll-contain">{[...conflict.tasks, { id: task.id, name: `${initialInput?.name ?? task.name} (reprogramada)`, event_name: '', estimated_hours: conflict.added_hours }].map(item => <li key={item.id} className="flex min-h-16 items-center justify-between gap-4 rounded-[10px] border border-[#dde2ea] bg-[#f9fafb] px-4 py-3"><span className="min-w-0 break-words text-sm font-semibold">{item.name}{item.event_name && <span className="mt-1 block text-xs font-normal text-[#667085]">{item.event_name}</span>}</span><span className="shrink-0 text-[13px] text-[#667085]">{hoursLabel(item.estimated_hours)}</span></li>)}</ul>
        </>}

        {stage === 'resolve' && conflict && <>
          <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="sr-only">Alternativa de resolución</legend>
            {([
              ...(conflict.suggestion ? [{ value: 'recommended' as const, title: `Mover ${task.name} al ${dateLabel(conflict.suggestion.date)}`, description: `Carga resultante: ${hoursLabel(conflict.suggestion.planned_hours)} / ${hoursLabel(conflict.daily_limit_hours)}` }] : []),
              { value: 'manual' as const, title: 'Elegir manualmente otro día', description: 'Consulta la carga antes de confirmar.' },
              { value: 'reduce' as const, title: 'Reducir el tiempo estimado', description: 'Úsalo solo si la estimación cambió.' },
            ]).map(item => <label key={item.value} className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-[12px] border p-3 focus-within:ring-2 focus-within:ring-[#4f46e5] ${item.value === 'recommended' ? 'sm:col-span-2' : ''} ${option === item.value ? 'border-[#4f46e5] bg-[#eef2ff]' : 'border-[#dde2ea] bg-[#f9fafb]'}`}><input type="radio" name="resolution" value={item.value} checked={option === item.value} disabled={busy} onChange={() => choose(item.value)} className="mt-1 accent-[#4f46e5]" /><span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold leading-5">{item.title}</span><span className="mt-1 block text-[13px] text-[#667085]">{item.description}</span></span>{item.value === 'recommended' && <span className="shrink-0 rounded-full bg-[#eff8ff] px-2 py-1 text-[11px] font-semibold text-[#175cd3]">Recomendada</span>}</label>)}
          </fieldset>
          {option === 'manual' && <div className="mt-4 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center"><label htmlFor="resolution-date" className="text-sm font-semibold">Otra fecha</label><Input id="resolution-date" type="date" min={today} max={eventDateLimit ?? getCalendarDate(conflict.event_date)} value={date} disabled={busy} onChange={event => { setDate(event.target.value); setError('') }} className="h-11" /></div>}
          {option === 'reduce' && <fieldset className="mt-4 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center"><legend className="sr-only">Tiempo estimado</legend>
            <p aria-hidden="true" className="text-sm font-semibold">Tiempo estimado</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex min-w-0 items-center gap-2"><label htmlFor="resolution-hours" className="shrink-0 text-sm font-semibold">Horas</label><Select value={durationInput?.hours ?? '0'} disabled={busy} onValueChange={hours => { setDurationInput(value => ({ hours, minutes: value?.minutes ?? '0' })); setError('') }}><SelectTrigger id="resolution-hours" className="min-w-0 flex-1 data-[size=default]:h-11"><SelectValue /></SelectTrigger><SelectContent position="popper">{hourOptions.map(hours => <SelectItem key={hours} value={String(hours)}>{hours}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex min-w-0 items-center gap-2"><label htmlFor="resolution-minutes" className="shrink-0 text-sm font-semibold">Minutos</label><Select value={durationInput?.minutes ?? '0'} disabled={busy} onValueChange={minutes => { setDurationInput(value => ({ hours: value?.hours ?? '0', minutes })); setError('') }}><SelectTrigger id="resolution-minutes" className="min-w-0 flex-1 data-[size=default]:h-11"><SelectValue /></SelectTrigger><SelectContent position="popper">{Array.from({ length: 60 }, (_, minutes) => <SelectItem key={minutes} value={String(minutes)}>{minutes}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </fieldset>}
          {!conflict.suggestion && <p className="mt-3 text-sm text-[#667085]">No encontramos un día viable en los próximos 30 días antes del evento. Elige otra fecha o revisa la estimación.</p>}
          {loadPreview}
          {errorFeedback}
        </>}
        {stage === 'preview' && loadPreview}
        {stage !== 'resolve' && errorFeedback}
        </div>}

        <div className={`mt-5 flex shrink-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end ${stage === 'success' || stage === 'confirm' ? 'sm:justify-center' : ''}`}>
          {stage !== 'success' && <Button type="button" variant="outline" disabled={busy} className={secondary} onClick={() => {
            if (stage === 'confirm') { setError(''); setStage('resolve') }
            else if (stage === 'resolve' && conflict) { setError(''); setStage('conflict') }
            else if (stage === 'conflict' && canReturnToPreview) { setError(''); setStage('preview') }
            else onClose()
          }}>{stage === 'resolve' || (stage === 'conflict' && canReturnToPreview) ? 'Volver' : stage === 'conflict' ? 'Cancelar reprogramación' : 'Cancelar'}</Button>}
          <Button type="button" disabled={busy || ((stage === 'preview' || stage === 'resolve' || stage === 'confirm') && (!ready || (stage !== 'preview' && Boolean(plan?.has_conflict))))} className={primary} onClick={() => {
            if (stage === 'success') onClose()
            else if (stage === 'conflict' && conflict) {
              if (!hasOpenedResolution) {
                choose(conflict.suggestion ? 'recommended' : 'manual')
                setHasOpenedResolution(true)
              }
              setStage('resolve')
            }
            else if (stage === 'resolve') setStage('confirm')
            else void save()
          }}>{busy ? 'Guardando…' : stage === 'preview' ? 'Reprogramar' : stage === 'conflict' ? 'Resolver conflicto' : stage === 'resolve' ? 'Aplicar opción' : stage === 'confirm' ? 'Aceptar' : 'Volver al plan'}</Button>
        </div>
        <DialogClose asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Cerrar" disabled={busy} className="absolute right-2 top-2 size-11 text-[#667085] hover:bg-[#f9fafb] hover:text-[#17212b]">
            <XIcon className="size-5" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
