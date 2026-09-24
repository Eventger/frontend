import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'

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
    navigate('/crear')
  }

  const handleOpenTask = (
    task: TodayTaskItem,
  ) => {
    navigate(
      `/evento/${task.eventId}`,
    )
  }

  const handleSeeUpcoming = () => {
    navigate('/eventos')
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
    <AppLayout>
      <div className="mx-auto w-full max-w-[1040px] px-4 py-6 sm:px-6 md:px-8 md:py-12">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#17212b] md:text-[32px]">
              Hoy
            </h1>

            <p className="mt-2 text-[13px] text-[#667085] md:text-[15px]">
              <span>
                {formatTodayDate()}
              </span>

              <span className="hidden md:inline">
                {' · '}
                Organiza primero lo
                que requiere atención
              </span>
            </p>
          </div>

          <Button
            type="button"
            onClick={
              handleCreateEvent
            }
            aria-label="Crear evento"
            className="size-11 shrink-0 rounded-full bg-[#4f46e5] p-0 text-white hover:bg-[#4338ca] md:h-12 md:w-auto md:rounded-[10px] md:px-5"
          >
            <Plus className="size-5" />

            <span className="hidden md:inline">
              Crear evento
            </span>
          </Button>
        </header>

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
                <main className="space-y-8">
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
                </main>

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
      </div>
    </AppLayout>
  )
}