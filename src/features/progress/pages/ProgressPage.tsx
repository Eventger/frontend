import { useNavigate } from 'react-router'
import { ArrowRight, CalendarDays, CheckCircle2, ListTodo } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageContent } from '@/components/layout/PageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { ProgressErrorState } from '@/features/progress/components/ProgressErrorState'
import { ProgressEmptyState } from '@/features/progress/components/ProgressEmptyState'
import { useProgress } from '@/features/progress/hooks/useProgress'

function ProgressLoadingState() {
  return (
    <div className="mt-8 space-y-4" aria-label="Cargando progreso" aria-busy="true">
      {[1, 2, 3].map(item => (
        <div key={item} className="animate-pulse rounded-xl border border-[#eaecf0] bg-white p-5">
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
          action={<PageHeaderCreateButton onClick={() => navigate('/crear', { viewTransition: true })} />}
        />

        {isLoading && <ProgressLoadingState />}

        {!isLoading && error && <ProgressErrorState onRetry={retry} />}

        {!isLoading && !error && data && data.events.length === 0 && (
          <section className="mt-8 rounded-xl border border-dashed border-[#d0d5dd] px-6 py-12 text-center">
            <CalendarDays className="mx-auto size-8 text-[#98a2b3]" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-[#17212b]">Aún no tienes eventos</h2>
            <p className="mt-1 text-sm text-[#667085]">Crea un evento para empezar a organizar tus actividades.</p>
          </section>
        )}

        {!isLoading && !error && data && data.events.length > 0 && (
          <section aria-label="Progreso de eventos" className="mt-8 space-y-4">
            {data.events.map(item => (
              <article key={item.event.id} className="rounded-xl border border-[#eaecf0] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/evento/${item.event.id}`, { viewTransition: true })}
                      className="text-left text-base font-semibold text-[#17212b] transition-colors hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                    >
                      {item.event.name}
                    </button>
                    <p className="mt-1 text-sm text-[#667085]">
                      {item.totalCount === 0
                        ? '0 de 0 tareas'
                        : `${item.completedCount} de ${item.totalCount} tareas completadas`}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg font-semibold tabular-nums text-[#3730a3]">
                    {item.percentage}%
                  </span>
                </div>

                <div
                  className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eef2f6]"
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