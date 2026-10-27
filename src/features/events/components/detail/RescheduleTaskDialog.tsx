import { useEffect, useRef, useState } from 'react'
import { Calendar, CalendarDays, Check, Clock, FileText, Info, Minus, Plus } from 'lucide-react'
import { Popover } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/DateInput'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
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
import { InlineDateCalendar } from './InlineDateCalendar'
import { DestructiveConfirmationDialog } from './DestructiveConfirmationDialog'

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

const primary = 'h-11 rounded-lg bg-[#4f46e5] px-5 text-white transition-none hover:bg-[#4f46e5] active:not-aria-[haspopup]:translate-y-0 sm:w-[216px]'
const secondary = 'h-11 rounded-lg border-border-subtle px-5 transition-none hover:bg-background active:not-aria-[haspopup]:translate-y-0 dark:hover:bg-input/30 sm:w-[216px]'
function dateLabel(date: string) {
  return formatCalendarDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
const hoursLabel = formatHoursDuration

function formatHoursDisplay(value: string | number): string {
  if (Number(value) === 0) return '0 h'
  return formatHoursDuration(value)
}

function formatStepperDisplay(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m} min`
  return `${h} h ${m} min`
}

function getConflictTaskPresentation(name: string, conflictDate: string, today: string) {
  const prefix = name.match(/^(Hoy|Vencida):\s*/i)
  const normalizedName = prefix ? name.slice(prefix[0].length) : name
  const status = prefix?.[1].toLowerCase() === 'hoy'
    ? 'today'
    : prefix?.[1].toLowerCase() === 'vencida'
      ? 'overdue'
      : conflictDate === today
        ? 'today'
        : conflictDate < today
          ? 'overdue'
          : 'upcoming'

  return {
    name: normalizedName,
    label: status === 'today' ? 'Hoy' : status === 'overdue' ? 'Vencida' : 'Próxima',
    tone: status === 'overdue'
      ? 'bg-[#feeeec] text-[#b42318]'
      : status === 'today'
        ? 'bg-[#fff7e6] text-[#c2410c]'
        : 'bg-[#eff8ff] text-[#175cd3]',
    metadataTone: status === 'overdue'
      ? 'text-[#b42318]'
      : status === 'today'
        ? 'text-[#c2410c]'
        : 'text-[#175cd3]',
    isOverdue: status === 'overdue',
  }
}

function previewError(error: unknown) {
  const message = getApiFieldError(error, 'target_date')
  if (message) return message
  return 'No pudimos consultar la carga de ese día. Inténtalo de nuevo.'
}

function getAvailableConflictMinutes(conflict: DayPlan): number {
  const limitMinutes = Math.round(Number(conflict.daily_limit_hours) * 60)
  const existingMinutes = Math.round(Number(conflict.existing_hours) * 60)
  return limitMinutes - existingMinutes
}

function calculateSuggestedReduction(conflict: DayPlan): { hours: string; minutes: string } {
  const originalMinutes = Math.round(Number(conflict.added_hours) * 60)
  const availableMinutes = getAvailableConflictMinutes(conflict)
  const targetMinutes = availableMinutes > 0 ? Math.min(originalMinutes, availableMinutes) : originalMinutes
  return {
    hours: String(Math.floor(targetMinutes / 60)),
    minutes: String(targetMinutes % 60),
  }
}

export function RescheduleTaskDialog({ task, eventDate, initialInput, initialConflict, getFocusFallback, preferFocusFallback = false, onClose, onSaved }: Props) {
  const { authenticatedRequest } = useAuthenticatedApi()
  const [taskEventDate, setTaskEventDate] = useState<string>()
  const [stage, setStage] = useState<'preview' | 'conflict' | 'resolve' | 'confirm' | 'success'>(initialConflict ? 'conflict' : 'preview')
  const today = getCalendarDate(new Date())
  const initialDateRef = useRef(initialConflict ? (initialInput?.targetDate ?? getCalendarDate(task.targetDate)) : '')
  const initialHoursRef = useRef(String(initialInput?.estimatedHours ?? task.estimatedHours))
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
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
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
  const availableConflictMinutes = conflict ? getAvailableConflictMinutes(conflict) : 0
  const canReduce = availableConflictMinutes > 0
  const isDirty = stage !== 'success' && (
    (date !== initialDateRef.current && Boolean(date)) ||
    hours !== initialHoursRef.current ||
    stage === 'resolve' ||
    stage === 'confirm' ||
    durationInput !== null
  )

  function handleRequestClose() {
    if (busy) return
    if (stage === 'success') {
      onClose()
      return
    }
    if (isDirty) {
      setIsConfirmDiscardOpen(true)
    } else {
      onClose()
    }
  }
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
  const shouldPreview = stage !== 'success' && stage !== 'confirm'

  useEffect(() => {
    if (eventDate) return
    let active = true
    void getEventById(task.eventId, authenticatedRequest)
      .then(event => { if (active) setTaskEventDate(event.eventDate) })
      .catch(() => undefined)
    return () => { active = false }
  }, [authenticatedRequest, eventDate, task.eventId])

  useEffect(() => {
    if (!shouldPreview) return
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
  }, [authenticatedRequest, date, numberHours, task.id, initialInput?.state, valid, reload, shouldPreview])

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
    if (next === 'reduce' && !canReduce) return
    setOption(next)
    setDate(next === 'recommended' && conflict.suggestion ? conflict.suggestion.date : conflict.date)
    const reduction = calculateSuggestedReduction(conflict)
    const targetHours = next === 'reduce'
      ? Number((Number(reduction.hours) + Number(reduction.minutes) / 60).toFixed(2))
      : Number(conflict.added_hours)
    setHours(String(targetHours))
    setDurationInput(next === 'reduce' ? reduction : null)
    setError('')
  }

  const originalMinutes = Math.round(Number(conflict?.added_hours ?? task.estimatedHours) * 60)
  const currentMinutes = durationInput
    ? Number(durationInput.hours) * 60 + Number(durationInput.minutes)
    : originalMinutes
  const reductionMinutes = Math.max(0, originalMinutes - currentMinutes)

  function handleDecreaseDuration(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nextMinutes = Math.max(15, currentMinutes - 15)
    const nextHours = Math.floor(nextMinutes / 60)
    const nextMins = nextMinutes % 60
    setDurationInput({ hours: String(nextHours), minutes: String(nextMins) })
    setError('')
  }

  function handleIncreaseDuration(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nextMinutes = Math.min(originalMinutes, currentMinutes + 15)
    const nextHours = Math.floor(nextMinutes / 60)
    const nextMins = nextMinutes % 60
    setDurationInput({ hours: String(nextHours), minutes: String(nextMins) })
    setError('')
  }

  const title = stage === 'preview' ? 'Reprogramar tarea' : stage === 'conflict' || stage === 'resolve' ? `Sobrecarga para el ${dateLabel(conflict?.date ?? date)}` : stage === 'confirm' ? '¿Estás seguro?' : 'Tarea reprogramada correctamente'
  const limit = plan ? hoursLabel(plan.daily_limit_hours) : ''
  const loadCardSize = stage === 'preview' ? 'h-[226px] sm:h-[240px]' : ''
  const loadPreview = (
    <div aria-live="polite" aria-busy={loading} className={`${stage === 'preview' ? 'mt-4 min-h-[220px] sm:min-h-[240px]' : 'mt-1 sm:mt-1.5'} transition-all`}>
      {stage === 'resolve' && hasMatchingPlan && plan && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#667085]">Vista previa de carga</p>
      )}
      {!date ? (
        <div data-load-preview-card className={`flex ${loadCardSize} flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-[#f9fafb] p-6 text-center`}>
          <div className="flex size-12 items-center justify-center rounded-full bg-[#f4f3ff] text-[#4f46e5]">
            <Calendar className="size-6" />
          </div>
          <p className="mt-3 text-base font-bold text-[#101828]">Elige una fecha</p>
          <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-[#667085]">
            para ver cómo quedará tu carga del día.
          </p>
          <span className="sr-only">Aquí verás la carga del día antes de reprogramar.</span>
        </div>
      ) : !valid ? (
        <p data-load-preview-card role="alert" className={`flex ${loadCardSize} items-center rounded-xl border border-[#fecdca] bg-[#fef3f2] p-4 text-xs font-medium text-[#b42318]`}>
          {date < today
            ? 'No puedes reprogramar una tarea para una fecha anterior a hoy.'
            : dateAfterEvent
              ? 'La fecha límite no puede ser posterior a la fecha del evento.'
              : 'Selecciona una fecha e ingresa una duración mayor que cero, con horas enteras y minutos entre 0 y 59.'}
        </p>
      ) : loading && !hasMatchingPlan ? (
        <div data-load-preview-card role="status" className={`flex ${loadCardSize} items-center justify-center rounded-2xl border border-border-subtle bg-[#f9fafb] p-6 text-xs text-[#667085]`}>
          Consultando la carga del día…
        </div>
      ) : hasMatchingPlan && plan ? (
        plan.has_conflict ? (
          <div data-load-preview-card className={`${loadCardSize} rounded-2xl border border-[#fecdca] bg-[#fef3f2] text-left ${stage === 'preview' ? 'p-4 sm:p-5' : 'p-2 sm:px-3 sm:py-2'}`}>
            <div className="flex items-center gap-2">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f04438] text-xs font-bold text-white">
                !
              </div>
              <span className="text-sm font-bold text-[#d92d20]">Excede tu límite</span>
              <span className="sr-only">Tu límite diario es {limit}. La sobrecarga sería de {hoursLabel(plan.overload_hours)}.</span>
            </div>

            <div className={`${stage === 'preview' ? 'my-3 py-2' : 'my-1 py-0.5'} grid grid-cols-3 divide-x divide-[#fecdca] text-center`}>
              <div className="px-1 text-center">
                <p className="text-xs font-medium text-[#667085]">Ya programadas</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-[#101828] sm:text-lg">{formatHoursDisplay(plan.existing_hours)}</p>
              </div>
              <div className="px-1 text-center">
                <p className="text-xs font-medium text-[#667085]">Esta tarea</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-[#101828] sm:text-lg">+ {formatHoursDisplay(plan.added_hours)}</p>
              </div>
              <div className="px-1 text-center">
                <p className="text-xs font-semibold text-[#d92d20]">Total del día</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-[#d92d20] sm:text-lg">{formatHoursDisplay(plan.planned_hours)}</p>
                <p className="text-[11px] text-[#667085]">de {limit}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#fee4e2]">
                <div
                  className="h-full rounded-full bg-[#f04438] transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(15, Math.round((Number(plan.planned_hours) / (Number(plan.planned_hours) + (Number(plan.overload_hours) > 0 ? 1 : 0))) * 100)))}%`
                  }}
                />
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-[#101828]">
                {formatHoursDisplay(plan.planned_hours)} / {limit}
              </span>
            </div>

            <div className={`${stage === 'preview' ? 'mt-3.5 px-3 py-2' : 'mt-2 px-2.5 py-1.5'} flex items-center gap-2 rounded-xl bg-[#fee4e2] text-xs font-semibold text-[#b42318]`}>
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#d92d20] text-[10px] font-bold text-white">
                !
              </div>
              <span>Excedes el límite en {formatHoursDisplay(plan.overload_hours)}.</span>
            </div>
          </div>
        ) : (
          <div data-load-preview-card className={`${loadCardSize} rounded-2xl border border-[#bbf7d0] bg-[#ecfdf3] text-left ${stage === 'preview' ? 'p-4 sm:p-5' : 'p-2 sm:px-3 sm:py-2'}`}>
            <div className="flex items-center gap-2">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#12b76a] text-white">
                <Check className="size-3 stroke-[3]" />
              </div>
              <span className="text-sm font-bold text-[#101828]">Dentro de tu límite</span>
              <span className="sr-only">La carga está dentro de tu límite diario de {limit}.</span>
            </div>

            <div className={`${stage === 'preview' ? 'my-3 py-2' : 'my-1 py-0.5'} grid grid-cols-3 divide-x divide-[#bbf7d0] text-center`}>
              <div className="px-1 text-center">
                <p className="text-xs font-medium text-[#667085]">Ya programadas</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-[#101828] sm:text-lg">{formatHoursDisplay(plan.existing_hours)}</p>
              </div>
              <div className="px-1 text-center">
                <p className="text-xs font-medium text-[#667085]">Esta tarea</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-[#101828] sm:text-lg">+ {formatHoursDisplay(plan.added_hours)}</p>
              </div>
              <div className="px-1 text-center">
                <p className="text-xs font-semibold text-[#027a48]">Total del día</p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-[#027a48] sm:text-lg">{formatHoursDisplay(plan.planned_hours)}</p>
                <p className="text-[11px] text-[#667085]">de {limit}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#d1fadf]">
                <div
                  className="h-full rounded-full bg-[#12b76a] transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(8, Math.round((Number(plan.planned_hours) / (Number(plan.daily_limit_hours) || 1)) * 100)))}%`
                  }}
                />
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-[#101828]">
                {formatHoursDisplay(plan.planned_hours)} / {limit}
              </span>
            </div>

            <div className={`${stage === 'preview' ? 'mt-3.5 px-3 py-2' : 'mt-2 px-2.5 py-1.5'} flex items-center gap-2 rounded-xl bg-[#d1fadf]/60 text-xs font-semibold text-[#027a48]`}>
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#027a48] text-white">
                <Check className="size-2.5 stroke-[3]" />
              </div>
              <span>Te quedan {formatHoursDisplay(Math.max(0, Number(plan.daily_limit_hours) - Number(plan.planned_hours)))} disponibles.</span>
            </div>
          </div>
        )
      ) : null}
    </div>
  )
  const errorFeedback = error && <InlineFeedback>{error}{!busy && <Button type="button" variant="link" onClick={() => { setError(''); if (stage === 'confirm') setStage('resolve'); setReload(value => value + 1) }}>Volver a consultar</Button>}</InlineFeedback>
  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open && !busy) handleRequestClose() }}>
      <DialogContent
        className="flex h-[min(760px,calc(100svh-2rem))] max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border-subtle bg-white p-5 sm:max-w-[840px] sm:p-6"
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
              <DialogTitle className={`type-dialog-title min-w-0 text-center text-[#17212b] ${stage === 'success' ? 'mt-7' : ''}`}>{title}</DialogTitle>
            </div>
            {stage === 'preview' && (
              <div data-reschedule-task-card className="mt-4 w-full rounded-xl border border-border-subtle bg-[#f8fafc] p-3.5 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 break-words text-sm font-bold text-[#101828] sm:text-base">{task.name}</p>
                  <span className="shrink-0 rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#4f46e5]">
                    {hoursLabel(task.estimatedHours)}
                  </span>
                </div>
                <div className="mt-2.5 space-y-1.5 text-xs text-[#475467]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0 text-[#4f46e5]" />
                    <span>Fecha actual: {formatCalendarDate(task.targetDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="sr-only">Actualmente: {dateLabel(task.targetDate)}</span>
                  </div>
                  <div className="flex min-h-8 items-center gap-2 sm:min-h-5">
                    {associatedEventDate ? (
                      <>
                        <FileText className="size-4 shrink-0 text-[#4f46e5]" />
                        <span>Fecha del evento: {formatCalendarDate(associatedEventDate, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
            <DialogDescription className={stage === 'preview' ? 'sr-only' : `type-body mt-4 text-center text-[#667085] ${stage === 'success' || stage === 'confirm' ? 'mx-auto max-w-[500px]' : ''}`}>
              {stage === 'preview' ? (
                `Reprogramar tarea ${task.name}`
              ) : stage === 'conflict' || stage === 'resolve' ? (
                'Revisa la sobrecarga y elige cómo ajustar la fecha.'
              ) : stage === 'confirm' ? (
                <>
                  <span className="block">¿Seguro que quieres reprogramar la subtarea?</span>
                  <span className="mt-2 block">Quedarías con {hoursLabel(plan?.planned_hours ?? 0)} para ese día (tu límite es {limit}).</span>
                  <span className="mt-3 block text-xs">{dateLabel(date)} · {hoursLabel(numberHours)}</span>
                </>
              ) : (
                `${initialInput?.name ?? task.name} quedó programada para el ${dateLabel(date)}. La carga de ese día es ${hoursLabel(plan?.planned_hours ?? 0)} de ${limit}.`
              )}
            </DialogDescription>
            {stage === 'confirm' && errorFeedback}
          </div>
        </div>

        {stage !== 'success' && stage !== 'confirm' && (
          <div
            tabIndex={0}
            role="region"
            aria-label="Contenido de reprogramación"
            className={`reschedule-dialog-scroll-region min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 ${stage === 'preview' ? '' : '[scrollbar-gutter:stable]'}`}
          >
          {stage === 'preview' && (
            <div>
              <div className="space-y-1.5">
                <p id="reschedule-calendar-label" className="type-label font-semibold text-[#101828]">Nueva fecha</p>
                <Popover.Root open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <Popover.Anchor asChild>
                    <DateInput
                      aria-labelledby="reschedule-calendar-label"
                      min={today}
                      max={eventDateLimit}
                      value={date}
                      disabled={busy}
                      onValueChange={value => { setDate(value); setError('') }}
                      onCalendarOpen={() => setCalendarOpen(true)}
                      calendarExpanded={calendarOpen}
                      calendarControls="reschedule-date-calendar"
                      calendarLabel="Abrir calendario de nueva fecha"
                      className="h-11"
                    />
                  </Popover.Anchor>
                  <Popover.Portal>
                    <Popover.Content
                      id="reschedule-date-calendar"
                      aria-label="Calendario para nueva fecha"
                      side="bottom"
                      align="center"
                      sideOffset={6}
                      collisionPadding={16}
                      avoidCollisions
                      style={{
                        maxHeight: 'min(460px, var(--radix-popover-content-available-height, calc(100svh - 2rem)))',
                      }}
                      className="z-[70] w-[calc(100vw-2rem)] max-w-[520px] overflow-y-auto overscroll-contain rounded-2xl outline-none"
                    >
                      <InlineDateCalendar
                        min={today}
                        max={eventDateLimit}
                        value={date}
                        disabled={busy}
                        onValueChange={value => {
                          setDate(value)
                          setError('')
                          setCalendarOpen(false)
                        }}
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
              <div>
                {loadPreview}
                {errorFeedback}
              </div>
            </div>
          )}

          {stage === 'conflict' && conflict && (
            <div className="flex flex-col gap-3">
              <div
                role="alert"
                className="rounded-xl border border-[#fedf89] bg-[#fffcf5] p-3 text-[#b54708] sm:p-4"
              >
                <span className="sr-only">
                  {hoursLabel(conflict.planned_hours)} / {hoursLabel(conflict.daily_limit_hours)}
                </span>
                <span className="sr-only">
                  {hoursLabel(conflict.overload_hours)} por encima de tu límite
                </span>
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <div className="grid flex-1 grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#475467] sm:text-xs">Programado</p>
                      <p className="truncate text-base font-bold text-[#101828] sm:text-[22px] md:text-2xl">
                        {hoursLabel(conflict.planned_hours)}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-[#eaecf0] sm:h-10" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#475467] sm:text-xs">Tu límite</p>
                      <p className="truncate text-base font-bold text-[#101828] sm:text-[22px] md:text-2xl">
                        {hoursLabel(conflict.daily_limit_hours)}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-[#eaecf0] sm:h-10" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#b42318] sm:text-xs">Exceso</p>
                      <p className="truncate text-base font-bold text-[#b42318] sm:text-[22px] md:text-2xl">
                        +{hoursLabel(conflict.overload_hours)}
                      </p>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-[#b42318] shadow-xs sm:size-10 sm:text-xl"
                  >
                    !
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#101828]">Estas tareas causan la sobrecarga</p>
                <p className="mt-0.5 text-xs text-[#667085]">
                  Son las tareas planificadas para este día que en conjunto superan tu límite de horas.
                </p>
                <ul
                  tabIndex={0}
                  role="region"
                  aria-label="Tareas que forman la carga del día"
                  className="mt-3 max-h-[min(34svh,280px)] space-y-2 overflow-y-auto overscroll-contain rounded-xl bg-[#f8fafc] p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40"
                >
                  {[
                    ...conflict.tasks,
                    {
                      id: task.id,
                      name: `${initialInput?.name ?? task.name} (reprogramada)`,
                      event_name: '',
                      estimated_hours: conflict.added_hours,
                    },
                  ].map(item => {
                    const presentation = getConflictTaskPresentation(item.name, conflict.date, today)
                    const StatusIcon = presentation.isOverdue ? Clock : CalendarDays

                    return (
                      <li
                        key={item.id}
                        className="flex min-h-[68px] items-center justify-between gap-3 rounded-xl border border-border-subtle bg-white px-3 py-2.5 shadow-xs"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className={`inline-flex w-[108px] shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold ${presentation.tone}`}>
                            <StatusIcon className="size-4" aria-hidden="true" />
                            {presentation.label}
                          </span>
                          <span className="min-w-0 break-words">
                            <span className="block text-sm font-semibold text-[#101828]">{presentation.name}</span>
                            <span className={`mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium ${presentation.metadataTone}`}>
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                                <time dateTime={conflict.date}>
                                  {formatCalendarDate(conflict.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </time>
                              </span>
                              {item.event_name && (
                                <>
                                  <span aria-hidden="true" className="text-[#475467]">•</span>
                                  <span className="font-normal text-[#667085]">{item.event_name}</span>
                                </>
                              )}
                            </span>
                          </span>
                        </span>
                        <span className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-medium tabular-nums ${presentation.metadataTone}`}>
                          <Clock className="size-4 shrink-0" aria-hidden="true" />
                          {hoursLabel(item.estimated_hours)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="mt-2 rounded-xl border border-[#e0e7ff] bg-[#f5f8ff] p-3 text-xs text-[#3730a3] sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 size-4 shrink-0 text-[#4f46e5]" aria-hidden="true" />
                  <div className="space-y-0.5 text-left">
                    <p className="font-semibold text-[#1e1b4b]">Tus otras tareas no se modificarán.</p>
                    <p className="leading-relaxed text-[#4338ca]">
                      Al continuar podrás elegir cómo resolverlo: reprogramar a un día recomendado sin sobrecarga, seleccionar otra fecha manualmente o reducir el tiempo de esta tarea.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stage === 'resolve' && conflict && (
            <fieldset className="flex flex-col gap-2.5">
              <legend className="sr-only">Alternativa de resolución</legend>
              <div>
                <p className="text-sm font-semibold text-[#101828]">Elige una opción para resolver la sobrecarga</p>
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {([
                    ...(conflict.suggestion
                      ? [
                        {
                          value: 'recommended' as const,
                          title: `Mover ${task.name} al ${dateLabel(conflict.suggestion.date)}`,
                          description: `Carga resultante: ${hoursLabel(conflict.suggestion.planned_hours)} / ${hoursLabel(conflict.daily_limit_hours)}`,
                          icon: Calendar,
                          disabled: false,
                        },
                      ]
                      : []),
                    {
                      value: 'manual' as const,
                      title: 'Elegir manualmente otro día',
                      description: 'Consulta la carga antes de confirmar.',
                      icon: Calendar,
                      disabled: false,
                    },
                    {
                      value: 'reduce' as const,
                      title: 'Reducir el tiempo estimado',
                      description: canReduce
                        ? 'Usa los botones para ajustar el tiempo de la tarea.'
                        : 'Ese día ya supera tu límite con otras tareas; elige otra fecha.',
                      icon: Clock,
                      disabled: !canReduce,
                    },
                  ]).map(item => {
                    const Icon = item.icon
                    const isSelected = option === item.value
                    return (
                      <div
                        key={item.value}
                        className={`relative rounded-xl transition-colors ${item.disabled
                            ? 'z-0 border border-border-subtle bg-[#f9fafb] p-2 opacity-60 sm:px-3 sm:py-2'
                            : isSelected
                              ? 'z-10 border-2 border-[#4f46e5] bg-[#f8f9ff] p-[7px] sm:px-[11px] sm:py-[7px]'
                              : 'z-0 border border-border-subtle bg-white p-2 sm:px-3 sm:py-2 hover:bg-[#f9fafb]'
                          }`}
                      >
                        <label className={`flex items-center gap-2.5 ${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name="resolution"
                            value={item.value}
                            checked={isSelected}
                            disabled={busy || item.disabled}
                            onChange={() => !item.disabled && choose(item.value)}
                            className="shrink-0 accent-[#4f46e5] focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
                          />
                          <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#eaecf0] bg-white shadow-xs ${item.disabled ? 'text-[#98a2b3]' : 'text-[#4f46e5]'}`}>
                            <Icon className="size-3.5 shrink-0" />
                          </div>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-xs font-semibold leading-tight sm:text-sm ${item.disabled ? 'text-[#667085]' : 'text-[#101828]'}`}>{item.title}</span>
                            <span className="mt-0.5 block text-[11px] text-[#667085] sm:text-xs">{item.description}</span>
                          </span>
                          {item.value === 'recommended' && (
                            <span className="shrink-0 rounded-full bg-[#eff8ff] px-2 py-0.5 text-[11px] font-semibold text-[#175cd3]">
                              Recomendada
                            </span>
                          )}
                          {item.value === 'reduce' && item.disabled && (
                            <span className="shrink-0 rounded-full bg-[#fef3f2] px-2 py-0.5 text-[11px] font-semibold text-[#b42318]">
                              Sin capacidad
                            </span>
                          )}
                        </label>

                        {item.value === 'reduce' && isSelected && (
                          <div className="mt-1.5 rounded-xl border border-[#eaecf0] bg-white p-2 shadow-xs sm:px-2.5 sm:py-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold text-[#101828] sm:text-sm">Nuevo tiempo estimado</p>
                                <p className="mt-0.5 text-[11px] text-[#667085] sm:text-xs">
                                  Tiempo actual: {formatStepperDisplay(originalMinutes)} • Reducción: {formatStepperDisplay(reductionMinutes)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  aria-label="Reducir tiempo estimado"
                                  disabled={busy || currentMinutes <= 15}
                                  onClick={handleDecreaseDuration}
                                  className="size-8 rounded-full border border-[#d0d5dd] bg-white text-[#344054] shadow-xs hover:bg-[#f9fafb] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  <Minus className="size-3.5" />
                                </Button>
                                <div
                                  aria-label="Tiempo estimado"
                                  className="min-w-[96px] rounded-lg border border-[#eaecf0] bg-[#f9fafb] px-3 py-1 text-center text-xs font-bold text-[#101828] sm:text-sm"
                                >
                                  {formatStepperDisplay(currentMinutes)}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  aria-label="Aumentar tiempo estimado"
                                  disabled={busy || currentMinutes >= originalMinutes}
                                  onClick={handleIncreaseDuration}
                                  className="size-8 rounded-full border border-[#d0d5dd] bg-white text-[#344054] shadow-xs hover:bg-[#f9fafb] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  <Plus className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {option === 'manual' && (
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                  <label htmlFor="resolution-date" className="type-label font-semibold">Otra fecha</label>
                  <DateInput
                    id="resolution-date"
                    min={today}
                    max={eventDateLimit ?? getCalendarDate(conflict.event_date)}
                    value={date}
                    disabled={busy}
                    onValueChange={value => { setDate(value); setError('') }}
                    calendarLabel="Abrir calendario de la otra fecha"
                    className="h-11"
                  />
                </div>
              )}

              {!conflict.suggestion && (
                <p className="text-xs text-[#667085]">
                  No encontramos un día viable en los próximos 30 días antes del evento. Elige otra fecha o revisa la estimación.
                </p>
              )}

              {loadPreview}
              {errorFeedback}
            </fieldset>
          )}
          {stage === 'conflict' && errorFeedback}
        </div>
      )}

        <div className="mt-5 flex shrink-0 flex-col-reverse justify-center gap-3 sm:flex-row">
          {stage !== 'success' && <Button type="button" variant="outline" disabled={busy} className={secondary} onClick={() => {
            if (stage === 'confirm') { setError(''); setStage('resolve') }
            else if (stage === 'resolve' && conflict) { setError(''); setStage('conflict') }
            else if (stage === 'conflict' && canReturnToPreview) { setError(''); setStage('preview') }
            else handleRequestClose()
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
      </DialogContent>
    </Dialog>

    <DestructiveConfirmationDialog
      open={isConfirmDiscardOpen}
      onOpenChange={setIsConfirmDiscardOpen}
      title="¿Descartar reprogramación?"
      description="Tienes cambios sin guardar en la fecha o estimación de la tarea. Si sales ahora, se perderán los cambios."
      confirmLabel="Descartar reprogramación"
      isDeleting={false}
      onConfirm={() => {
        setIsConfirmDiscardOpen(false)
        onClose()
      }}
    />
    </>
  )
}
