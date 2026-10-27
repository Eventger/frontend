import { useNavigate } from 'react-router'
import { ArrowRight, Calendar, CalendarDays, CheckCircle2, ListTodo } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageContent } from '@/components/layout/PageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { ProgressErrorState } from '@/features/progress/components/ProgressErrorState'
import { ProgressEmptyState } from '@/features/progress/components/ProgressEmptyState'
import { useProgress } from '@/features/progress/hooks/useProgress'
import { formatCalendarDate } from '@/lib/calendar'

function ProgressLoadingState() {
  return (
    <div className="mt-10 space-y-4" aria-label="Cargando progreso" aria-busy="true">
      {[1, 2, 3].map(item => (
        <div key={item} className="min-h-[190px] animate-pulse rounded-2xl border border-border-subtle bg-white p-5">
          <div className="h-4 w-1/3 rounded bg-[#eaecf0]" />
          <div className="mt-4 h-2 w-full rounded-full bg-[#f2f4f7]" />
          <div className="mt-3 h-3 w-1/4 rounded bg-[#f2f4f7]" />
        </div>
      ))}
    </div>
  )
}

export function ProgressPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, retry } = useProgress()

  return (
    <PageContainer breadcrumbs={[{ label: 'Progreso' }]}>
      <PageContent>
        <PageHeader
          title="Progreso"
          description="Una vista rápida del avance de todos tus eventos."
          action={<span className="md:hidden"><PageHeaderCreateButton onClick={() => navigate('/crear', { viewTransition: true })} /></span>}
        />

        {isLoading && <ProgressLoadingState />}

        {!isLoading && error && (
          <div className="mt-10 md:mt-[116px]">
            <ProgressErrorState onRetry={retry} />
          </div>
        )}

        {!isLoading && !error && data && data.events.length === 0 && (
          <div className="mt-10 md:mt-[116px]">
            <section className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#d0d5dd] bg-[#fafbfd] px-6 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f46e5] shadow-xs">
                <CalendarDays className="size-7 text-[#4f46e5]" aria-hidden="true" />
              </div>
              <h2 className="type-dialog-title mt-6 text-[#17212b]">Aún no tienes eventos</h2>
              <p className="mt-[18px] w-full max-w-[540px] text-sm leading-5 text-[#667085] sm:text-[15px]">Crea tu primer evento para organizar sus tareas y hacer seguimiento a su preparación.</p>
              <Button
                type="button"
                className="mt-[30px] h-11 min-w-[167px] rounded-lg bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca]"
                onClick={() => navigate('/crear', { viewTransition: true })}
              >
                Planificar primer evento
              </Button>
            </section>
          </div>
        )}

        {!isLoading && !error && data && data.events.length > 0 && (
          <section aria-label="Progreso de eventos" className="mt-8 space-y-4">
            {data.events.map(item => (
              <article key={item.event.id} className="min-h-[190px] rounded-2xl border border-border-subtle bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/evento/${item.event.id}`, { viewTransition: true })}
                      className="min-h-11 text-left type-section-title text-[#17212b] transition-colors hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] sm:min-h-0"
                    >
                      {item.event.name}
                    </button>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#667085]">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#475467]">
                        <Calendar className="size-3.5 text-[#98a2b3]" aria-hidden="true" />
                        {formatCalendarDate(item.event.eventDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>
                        {item.totalCount === 0
                          ? '0 de 0 tareas'
                          : `${item.completedCount} de ${item.totalCount} tareas completadas`}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-lg font-semibold tabular-nums text-[#3730a3]">
                    {item.percentage}%
                  </span>
                </div>

                <div
                  className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100"
                  role="progressbar"
                  aria-label={`Progreso de ${item.event.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.percentage}
                >
                  <div
                    className="h-full rounded-full bg-[#4f46e5] transition-[width] duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                {item.totalCount === 0 ? (
                  <ProgressEmptyState eventId={item.event.id} eventName={item.event.name} />
                ) : (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#667085]">
                      {item.completedCount === item.totalCount
                        ? <CheckCircle2 className="size-4 text-[#16a34a]" aria-hidden="true" />
                        : <ListTodo className="size-4" aria-hidden="true" />}
                      <span>{item.completedCount === item.totalCount ? 'Todas las tareas completadas' : 'Avance de actividades'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/evento/${item.event.id}`, { viewTransition: true })}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#4338ca] hover:text-[#3730a3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                    >
                      Ver evento <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </PageContent>
    </PageContainer>
  )
}
