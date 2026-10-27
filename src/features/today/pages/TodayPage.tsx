import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useNavigate } from 'react-router'
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'
import { RegisterProgressDialog } from '@/features/events/components/detail/RegisterProgressDialog'
import type { Subtask } from '@/features/events/types/subtask.types'
import { getEventById } from '@/features/events/services/event.service'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageContent } from '@/components/layout/PageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { Button } from '@/components/ui/button'
import { CALENDAR_TIME_ZONE, getCalendarDate } from '@/lib/calendar'
import { cn } from '@/lib/utils'

import { TodayEmptyState } from '@/features/today/components/TodayEmptyState'
import { TodayErrorState } from '@/features/today/components/TodayErrorState'
import { TodayFilters } from '@/features/today/components/TodayFilters'
import type { TodayStateFilter } from '@/features/today/components/TodayFilters'
import { TodayLoadingState } from '@/features/today/components/TodayLoadingState'
import { TodayNoResultsState } from '@/features/today/components/TodayNoResultsState'
import { TodayPriorityGuide } from '@/features/today/components/TodayPriorityGuide'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayTaskSection } from '@/features/today/components/TodayTaskSection'
import { DailyLimitDialog } from '@/features/today/components/DailyLimitDialog'

import { useToday } from '@/features/today/hooks/useToday'

import type {
  TodayTaskItem,
} from '@/features/today/types/today.types'

function formatTodayDate(
  month: 'long' | 'short' =
    'long',
  dateString?: string,
) {
  const date = dateString
    ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(dateString) ? `${dateString}T12:00:00-05:00` : dateString)
    : new Date()

  const formatted =
    new Intl.DateTimeFormat(
      'es-CO',
      {
        weekday: 'long',
        day: 'numeric',
        month,
        year: 'numeric',
        timeZone: CALENDAR_TIME_ZONE,
      },
    ).format(date)

  return (
    formatted.charAt(0).toUpperCase() +
    formatted.slice(1)
  )
}

function getPlannedHours(
  tasks: TodayTaskItem[],
) {
  return tasks.reduce(
    (total, task) =>
      total +
      task.estimatedHours,
    0,
  )
}

export function TodayPage() {
  const navigate = useNavigate()
  const { authenticatedRequest } = useAuthenticatedApi()
  const preferences = usePlanningPreferences()
  const dailyLimitHours = preferences.isLoading || preferences.error ? undefined : preferences.dailyLimitHours
  const [reschedulingTask, setReschedulingTask] = useState<{ task: TodayTaskItem; eventDate: string } | null>(null)
  const [progressTask, setProgressTask] = useState<Subtask | null>(null)
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false)
  const [loadingRescheduleId, setLoadingRescheduleId] = useState<number | null>(null)
  const [rescheduleError, setRescheduleError] = useState('')
  const rescheduleRequestVersion = useRef(0)

  useEffect(() => {
    const requests = rescheduleRequestVersion
    return () => { requests.current++ }
  }, [])

  const [
    selectedEventId,
    setSelectedEventId,
  ] = useState('all')

  const [
    selectedState,
    setSelectedState,
  ] =
    useState<TodayStateFilter>(
      'all',
    )

  const [selectedDate, setSelectedDate] = useState('')

  const {
    data,
    isLoading,
    isRefetching = false,
    error,
    retry,
  } = useToday(selectedDate || undefined)

  const isInitialLoading = isLoading && data === null

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null)

  const activeTaskId = hoveredTaskId ?? selectedTaskId

  const handleCreateEvent = () => {
    navigate('/crear', {
      viewTransition: true,
    })
  }

  const handleViewUpcoming = () => {
    navigate('/eventos', {
      viewTransition: true,
    })
  }

  const handleOpenTask = (
    task: TodayTaskItem,
  ) => {
    navigate(
      `/evento/${task.eventId}?tarea=${task.id}`,
      { viewTransition: true },
    )
  }

  const handleRescheduleTask = async (task: TodayTaskItem) => {
    const version = ++rescheduleRequestVersion.current
    setLoadingRescheduleId(task.id)
    setRescheduleError('')
    try {
      const event = await getEventById(task.eventId, authenticatedRequest)
      if (version === rescheduleRequestVersion.current) {
        setReschedulingTask({ task, eventDate: event.eventDate })
      }
    } catch {
      if (version === rescheduleRequestVersion.current) {
        setRescheduleError('No pudimos cargar la fecha del evento. Inténtalo de nuevo.')
      }
    } finally {
      if (version === rescheduleRequestVersion.current) setLoadingRescheduleId(null)
    }
  }

  const handleRegisterProgress = (task: TodayTaskItem) => {
    setProgressTask({
      id: task.id,
      eventId: task.eventId,
      state: task.state,
      name: task.name,
      targetDate: task.targetDate,
      estimatedHours: task.estimatedHours,
      details: task.details,
    })
  }

  const handleClearFilters = () => {
    setSelectedEventId('all')
    setSelectedState('all')
    setSelectedDate('')
  }

  const hasPriorities =
    data !== null &&
    (
      data.overdue.length > 0 ||
      data.today.length > 0 ||
      data.upcoming.length > 0
    )

  const eventOptions =
    useMemo(() => {
      if (!data) {
        return []
      }

      const allTasks = [
        ...data.overdue,
        ...data.today,
        ...data.upcoming,
      ]

      const events = new Map<
        number,
        string
      >()

      allTasks.forEach((task) => {
        events.set(
          task.eventId,
          task.eventName,
        )
      })

      return Array.from(
        events.entries(),
      )
        .map(([id, name]) => ({
          id,
          name,
        }))
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
            'es',
          ),
        )
    }, [data])

  const effectiveEventId = eventOptions.some(event => String(event.id) === selectedEventId)
    ? selectedEventId
    : 'all'

  const filterByEvent = (
    tasks: TodayTaskItem[],
  ) => {
    if (
      effectiveEventId === 'all'
    ) {
      return tasks
    }

    return tasks.filter(
      (task) =>
        task.eventId ===
        Number(effectiveEventId),
    )
  }

  const filterByDate = (
    tasks: TodayTaskItem[],
  ) => {
    if (!selectedDate) {
      return tasks
    }

    return tasks.filter(
      (task) =>
        getCalendarDate(task.targetDate) === selectedDate,
    )
  }

  const filterTaskGroup = (
    tasks: TodayTaskItem[],
  ) => {
    return filterByDate(filterByEvent(tasks))
  }

  const filteredOverdue =
    selectedState === 'all' ||
      selectedState === 'overdue'
      ? filterTaskGroup(
        data?.overdue ?? [],
      )
      : []

  const filteredToday =
    selectedState === 'all' ||
      selectedState === 'today'
      ? filterTaskGroup(
        data?.today ?? [],
      )
      : []

  const filteredUpcoming =
    selectedState === 'all' ||
      selectedState === 'upcoming'
      ? filterTaskGroup(
        data?.upcoming ?? [],
      )
      : []

  const filteredTaskCount =
    filteredOverdue.length +
    filteredToday.length +
    filteredUpcoming.length

  const hasActiveFilters =
    effectiveEventId !== 'all' ||
    selectedState !== 'all' ||
    Boolean(selectedDate)

  const hasFilteredResults =
    filteredTaskCount > 0

  const plannedHours =
    getPlannedHours(
      filteredToday,
    )

  const totalPlannedHoursToday =
    getPlannedHours(
      data?.today ?? [],
    )

  const isOverloadedToday =
    dailyLimitHours !== undefined && totalPlannedHoursToday > dailyLimitHours

  const selectedEventName =
    eventOptions.find(
      (event) =>
        String(event.id) ===
        effectiveEventId,
    )?.name

  const stateLabels: Record<
    TodayStateFilter,
    string
  > = {
    all: 'Todos',
    today: 'Para hoy',
    upcoming: 'Próximas',
    overdue: 'Vencidas',
  }

  const subtitle =
    hasActiveFilters
      ? `${filteredTaskCount} ${filteredTaskCount === 1 ? 'subtarea coincide' : 'subtareas coinciden'} con los filtros aplicados`
      : !isInitialLoading &&
        !error &&
        data &&
        !hasPriorities
        ? ''
        : 'Organiza primero lo que requiere atención'

  return (
    <PageContainer breadcrumbs={[{ label: 'Hoy' }]}>
      <PageContent>
        <PageHeader
          title="Hoy"
          description={
            <>
              <span className="sm:hidden">
                {formatTodayDate(
                  'short',
                  selectedDate,
                )}
              </span>

              <span className="hidden sm:inline">
                {formatTodayDate(
                  'long',
                  selectedDate,
                )}
              </span>

              {subtitle && (
                <span className="hidden sm:inline">
                  {' · '}
                  {subtitle}
                </span>
              )}
            </>
          }
          action={
            <span className="md:hidden">
              <PageHeaderCreateButton
                onClick={
                  handleCreateEvent
                }
              />
            </span>
          }
        />

        {isInitialLoading && (
          <div className="mt-10">
            <TodayLoadingState />
          </div>
        )}

        {!isInitialLoading &&
          error &&
          !data && (
            <div className="mt-10 md:mt-[116px]">
              <TodayErrorState
                onRetry={() => {
                  void retry()
                }}
              />
            </div>
          )}

        {!isInitialLoading &&
          !error &&
          data &&
          !hasPriorities && (
            <div className="mt-10 md:mt-[116px]">
              <TodayEmptyState
                onViewUpcoming={
                  handleViewUpcoming
                }
                onCreateEvent={
                  handleCreateEvent
                }
                isFirstTime={
                  (data.completed?.length ?? 0) === 0
                }
              />
            </div>
          )}

        {!isInitialLoading &&
          data &&
          hasPriorities && (
            <>
              <div className="mt-6">
                <TodaySummary
                  overdueCount={
                    filteredOverdue.length
                  }
                  todayCount={
                    filteredToday.length
                  }
                  upcomingCount={
                    filteredUpcoming.length
                  }
                  plannedHours={
                    plannedHours
                  }
                  dailyLimitHours={
                    dailyLimitHours
                  }
                  isFiltered={
                    hasActiveFilters
                  }
                  onEditDailyLimit={() => setIsLimitDialogOpen(true)}
                />
              </div>

              {isOverloadedToday && (
                <InlineFeedback variant="warning" className="mt-4">
                  {hasActiveFilters
                    ? `Tu planificación total de hoy (${totalPlannedHoursToday} h) supera tus ${dailyLimitHours} horas disponibles. Revisa tus tareas o `
                    : `Tu planificación de hoy supera tus ${dailyLimitHours} horas disponibles. Revisa tus tareas o `}
                  <button
                    type="button"
                    onClick={() => setIsLimitDialogOpen(true)}
                    className="cursor-pointer font-semibold underline hover:text-[#93370d]"
                  >
                    cambia tus horas
                  </button>
                  .
                </InlineFeedback>
              )}
              {preferences.error && (
                <div role="status" aria-label={preferences.error}>
                  <InlineFeedback variant="warning" className="mt-4">
                    {preferences.error} <Button type="button" variant="link" onClick={() => { void preferences.refresh() }}>Reintentar</Button>
                  </InlineFeedback>
                </div>
              )}

              <div className="mt-4">
                <TodayFilters
                  events={
                    eventOptions
                  }
                  selectedEventId={
                    effectiveEventId
                  }
                  selectedState={
                    selectedState
                  }
                  selectedDate={
                    selectedDate
                  }
                  onEventChange={
                    setSelectedEventId
                  }
                  onStateChange={
                    setSelectedState
                  }
                  onDateChange={
                    setSelectedDate
                  }
                  onClear={
                    handleClearFilters
                  }
                />
              </div>

              <div className="mt-3">
                <TodayPriorityGuide />
              </div>

              {error && (
                <InlineFeedback variant="error" className="mt-4">
                  {error}
                </InlineFeedback>
              )}

              {rescheduleError && <InlineFeedback className="mt-4">{rescheduleError}</InlineFeedback>}

              <div
                className={cn(
                  'transition-opacity duration-200',
                  isRefetching && 'opacity-60 pointer-events-none',
                )}
                aria-busy={isRefetching}
              >
                {hasActiveFilters &&
                  !hasFilteredResults ? (
                  <div className="mt-6">
                    <TodayNoResultsState
                      eventName={
                        selectedEventName
                      }
                      stateLabel={
                        selectedState !==
                          'all'
                          ? stateLabels[
                          selectedState
                          ]
                          : undefined
                      }
                      onClearFilters={
                        handleClearFilters
                      }
                    />
                  </div>
                ) : (
                  <section
                    id="prioritized-tasks"
                    aria-label="Tareas priorizadas"
                    onMouseLeave={() => setHoveredTaskId(null)}
                    className="mt-6 space-y-4"
                  >
                    <TodayTaskSection
                      title="Vencidas"
                      description=""
                      tasks={
                        filteredOverdue
                      }
                      group="overdue"
                      activeTaskId={activeTaskId}
                      onTaskMouseEnter={setHoveredTaskId}
                      onTaskFocus={(id) => {
                        setHoveredTaskId(id)
                        setSelectedTaskId(id)
                      }}
                      onTaskClick={setSelectedTaskId}
                      onOpenTask={handleOpenTask}
                      onRegisterProgress={handleRegisterProgress}
                      onRescheduleTask={handleRescheduleTask}
                      loadingRescheduleId={loadingRescheduleId}
                    />

                    <TodayTaskSection
                      title="Para hoy"
                      description=""
                      tasks={
                        filteredToday
                      }
                      group="today"
                      activeTaskId={activeTaskId}
                      onTaskMouseEnter={setHoveredTaskId}
                      onTaskFocus={(id) => {
                        setHoveredTaskId(id)
                        setSelectedTaskId(id)
                      }}
                      onTaskClick={setSelectedTaskId}
                      onOpenTask={handleOpenTask}
                      onRegisterProgress={handleRegisterProgress}
                      onRescheduleTask={handleRescheduleTask}
                      loadingRescheduleId={loadingRescheduleId}
                    />

                    <TodayTaskSection
                      title="Próximas"
                      description=""
                      tasks={
                        filteredUpcoming
                      }
                      group="upcoming"
                      activeTaskId={activeTaskId}
                      onTaskMouseEnter={setHoveredTaskId}
                      onTaskFocus={(id) => {
                        setHoveredTaskId(id)
                        setSelectedTaskId(id)
                      }}
                      onTaskClick={setSelectedTaskId}
                      onOpenTask={handleOpenTask}
                      onRegisterProgress={handleRegisterProgress}
                      onRescheduleTask={handleRescheduleTask}
                      loadingRescheduleId={loadingRescheduleId}
                    />
                  </section>
                )}
              </div>
            </>
          )}
      </PageContent>
      {progressTask && <RegisterProgressDialog key={progressTask.id} task={progressTask} onClose={() => setProgressTask(null)} onSaved={async () => { await retry() }} />}
      {reschedulingTask && <RescheduleTaskDialog key={reschedulingTask.task.id} task={reschedulingTask.task} eventDate={reschedulingTask.eventDate} onClose={() => setReschedulingTask(null)} onSaved={retry} />}
      <DailyLimitDialog
        open={isLimitDialogOpen}
        onOpenChange={setIsLimitDialogOpen}
        currentHours={preferences.dailyLimitHours}
        onSave={async (hours) => {
          await preferences.save(hours)
        }}
        onNavigateToHoy={() => {
          setIsLimitDialogOpen(false)
          navigate('/hoy')
          const tasksSection = document.getElementById('prioritized-tasks')
          tasksSection?.scrollIntoView({ behavior: 'smooth' })
        }}
      />
    </PageContainer>
  )
}
