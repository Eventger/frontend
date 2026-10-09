import {
  useMemo,
  useState,
} from 'react'

import { useNavigate } from 'react-router'
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageContent } from '@/components/layout/PageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { FeedbackIcon } from '@/components/feedback/FeedbackIcon'
import { Button } from '@/components/ui/button'
import { CALENDAR_TIME_ZONE } from '@/lib/calendar'

import { TodayEmptyState } from '@/features/today/components/TodayEmptyState'
import { TodayErrorState } from '@/features/today/components/TodayErrorState'
import { TodayFilters } from '@/features/today/components/TodayFilters'
import type { TodayStateFilter } from '@/features/today/components/TodayFilters'
import { TodayLoadingState } from '@/features/today/components/TodayLoadingState'
import { TodayNoResultsState } from '@/features/today/components/TodayNoResultsState'
import { TodayPriorityGuide } from '@/features/today/components/TodayPriorityGuide'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayTaskSection } from '@/features/today/components/TodayTaskSection'

import { useToday } from '@/features/today/hooks/useToday'

import type {
  TodayTaskItem,
} from '@/features/today/types/today.types'

function formatTodayDate(
  month: 'long' | 'short' =
    'long',
) {
  const formatted =
    new Intl.DateTimeFormat(
      'es-CO',
      {
        weekday: 'long',
        day: 'numeric',
        month,
        timeZone: CALENDAR_TIME_ZONE,
      },
    ).format(new Date())

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
  const preferences = usePlanningPreferences()
  const dailyLimitHours = preferences.isLoading || preferences.error ? undefined : preferences.dailyLimitHours
  const [reschedulingTask, setReschedulingTask] = useState<TodayTaskItem | null>(null)

  const {
    data,
    isLoading,
    error,
    retry,
  } = useToday()

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
      `/evento/${task.eventId}`,
      { viewTransition: true },
    )
  }

  const handleClearFilters = () => {
    setSelectedEventId('all')
    setSelectedState('all')
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

  const filteredOverdue =
    selectedState === 'all' ||
    selectedState === 'overdue'
      ? filterByEvent(
          data?.overdue ?? [],
        )
      : []

  const filteredToday =
    selectedState === 'all' ||
    selectedState === 'today'
      ? filterByEvent(
          data?.today ?? [],
        )
      : []

  const filteredUpcoming =
    selectedState === 'all' ||
    selectedState === 'upcoming'
      ? filterByEvent(
          data?.upcoming ?? [],
        )
      : []

  const filteredTaskCount =
    filteredOverdue.length +
    filteredToday.length +
    filteredUpcoming.length

  const hasActiveFilters =
    effectiveEventId !== 'all' ||
    selectedState !== 'all'

  const hasFilteredResults =
    filteredTaskCount > 0

  const plannedHours =
    getPlannedHours(
      filteredToday,
    )

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
      : !isLoading &&
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
                )}
              </span>

              <span className="hidden sm:inline">
                {formatTodayDate()}
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
            <PageHeaderCreateButton
              onClick={
                handleCreateEvent
              }
            />
          }
        />

        {isLoading && (
          <div className="mt-10">
            <TodayLoadingState />
          </div>
        )}

        {!isLoading &&
          error && (
            <div className="mt-[116px]">
              <TodayErrorState
                onRetry={() => {
                  void retry()
                }}
              />
            </div>
          )}

        {!isLoading &&
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
              />
            </div>
          )}

        {!isLoading &&
          !error &&
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
                />
              </div>

              {!hasActiveFilters && dailyLimitHours !== undefined && plannedHours > dailyLimitHours && (
                <InlineFeedback variant="warning" className="mt-4">
                  Tu planificación de hoy supera el límite diario de {dailyLimitHours} horas. Revisa tus tareas para reducir la sobrecarga.
                </InlineFeedback>
              )}
              {preferences.error && (
                <section
                  role="status"
                  aria-live="polite"
                  aria-labelledby="today-limit-warning-title"
                  className="mt-8 flex w-full flex-col items-center rounded-[12px] border border-[#fedf89] bg-[#fffaeb] px-5 py-4 text-center"
                >
                  <FeedbackIcon variant="warning" size="small" />
                  <h2 id="today-limit-warning-title" className="mt-2 text-[15px] font-semibold leading-5 text-[#17212b]">
                    {preferences.error}
                  </h2>
                  <p className="mt-1 max-w-[520px] text-[13px] leading-5 text-[#667085]">
                    La capacidad de hoy se actualizará cuando recuperemos tu límite.
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => { void preferences.refresh() }}
                    className="mt-1 min-h-11 px-3 text-[#b54708] hover:text-[#93370d]"
                  >
                    Reintentar
                  </Button>
                </section>
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
                  onEventChange={
                    setSelectedEventId
                  }
                  onStateChange={
                    setSelectedState
                  }
                  onClear={
                    handleClearFilters
                  }
                />
              </div>

              <div className="mt-3">
                <TodayPriorityGuide />
              </div>

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
                <section aria-label="Tareas priorizadas" className="mt-6 space-y-4">
                  <TodayTaskSection
                    title="Vencidas"
                    description=""
                    tasks={
                      filteredOverdue
                    }
                    group="overdue"
                    onOpenTask={handleOpenTask}
                    onRescheduleTask={setReschedulingTask}
                  />

                  <TodayTaskSection
                    title="Para hoy"
                    description=""
                    tasks={
                      filteredToday
                    }
                    group="today"
                    onOpenTask={handleOpenTask}
                    onRescheduleTask={setReschedulingTask}
                  />

                  <TodayTaskSection
                    title="Próximas"
                    description=""
                    tasks={
                      filteredUpcoming
                    }
                    group="upcoming"
                    onOpenTask={handleOpenTask}
                    onRescheduleTask={setReschedulingTask}
                  />
                </section>
              )}
            </>
          )}
      </PageContent>
      {reschedulingTask && <RescheduleTaskDialog key={reschedulingTask.id} task={reschedulingTask} onClose={() => setReschedulingTask(null)} onSaved={retry} />}
    </PageContainer>
  )
}
