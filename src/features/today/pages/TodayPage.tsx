import { useNavigate } from 'react-router'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'

import { TodayEmptyState } from '@/features/today/components/TodayEmptyState'
import { TodayErrorState } from '@/features/today/components/TodayErrorState'
import { TodayLoadingState } from '@/features/today/components/TodayLoadingState'
import { TodayPriorityGuide } from '@/features/today/components/TodayPriorityGuide'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayTaskSection } from '@/features/today/components/TodayTaskSection'

import { useToday } from '@/features/today/hooks/useToday'

import type {
  TodayTaskItem,
} from '@/features/today/types/today.types'

function formatTodayDate() {
  const formatted =
    new Intl.DateTimeFormat(
      'es-CO',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
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

  const {
    data,
    isLoading,
    error,
    retry,
  } = useToday()

  const handleCreateEvent = () => {
    navigate('/crear', {
      viewTransition: true,
    })
  }

  const handleOpenTask = (
    task: TodayTaskItem,
  ) => {
    navigate(
      `/evento/${task.eventId}`,
      {
        viewTransition: true,
      },
    )
  }

  const handleSeeUpcoming = () => {
    navigate('/eventos', {
      viewTransition: true,
    })
  }

  const hasPriorities =
    data !== null &&
    (
      data.overdue.length > 0 ||
      data.today.length > 0 ||
      data.upcoming.length > 0
    )

  const plannedHours =
    data
      ? getPlannedHours(
          data.today,
        )
      : 0

  return (
    <PageContainer>
        {/* Header */}
        <PageHeader
          title="Hoy"
          description={
            <>
              <span>
                {formatTodayDate()}
              </span>

              <span className="hidden md:inline">
                {' · '}
                Organiza primero lo
                que requiere atención
              </span>
            </>
          }
          action={
            <PageHeaderCreateButton
              onClick={handleCreateEvent}
            />
          }
        />

        {/* Loading */}
        {isLoading && (
          <div className="mt-8">
            <TodayLoadingState />
          </div>
        )}

        {/* Error */}
        {!isLoading &&
          error && (
            <div className="mt-10">
              <TodayErrorState
                onRetry={() => {
                  void retry()
                }}
              />
            </div>
          )}

        {/* Empty */}
        {!isLoading &&
          !error &&
          data &&
          !hasPriorities && (
            <div className="mt-10 md:mt-32">
              <TodayEmptyState
                onSeeUpcoming={
                  handleSeeUpcoming
                }
                onCreateEvent={
                  handleCreateEvent
                }
              />
            </div>
          )}

        {/* Success */}
        {!isLoading &&
          !error &&
          data &&
          hasPriorities && (
            <>
              <div className="mt-7">
                <TodaySummary
                  overdueCount={
                    data.overdue
                      .length
                  }
                  todayCount={
                    data.today.length
                  }
                  upcomingCount={
                    data.upcoming
                      .length
                  }
                  plannedHours={
                    plannedHours
                  }
                />
              </div>

              <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,790px)_228px] lg:items-start lg:gap-[22px]">
                {/* Priority groups */}
                <div className="space-y-8">
                  <TodayTaskSection
                    title="Vencidas"
                    description="Primero resuelve lo que ya superó su plazo."
                    tasks={
                      data.overdue
                    }
                    group="overdue"
                    onOpenTask={
                      handleOpenTask
                    }
                  />

                  <TodayTaskSection
                    title="Para hoy"
                    description="Gestiones que vencen hoy y deben atenderse antes de terminar el día."
                    tasks={
                      data.today
                    }
                    group="today"
                    onOpenTask={
                      handleOpenTask
                    }
                  />

                  <TodayTaskSection
                    title="Próximas"
                    description="Prepárate para lo que vence pronto"
                    tasks={
                      data.upcoming
                    }
                    group="upcoming"
                    onOpenTask={
                      handleOpenTask
                    }
                  />
                </div>

                {/* Desktop priority explanation */}
                <div className="hidden lg:block">
                  <TodayPriorityGuide />
                </div>

                {/* Mobile/tablet explanation */}
                <div className="lg:hidden">
                  <TodayPriorityGuide />
                </div>
              </div>
            </>
          )}
    </PageContainer>
  )
}
