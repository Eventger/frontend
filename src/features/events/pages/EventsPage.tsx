import { useNavigate, useSearchParams } from 'react-router'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageContent } from '@/components/layout/PageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { EmptyEventsState } from '@/features/events/components/EmptyEventsState'
import { EventCard } from '@/features/events/components/EventCard'
import { EventsErrorState } from '@/features/events/components/EventsErrorState'
import { EventsLoadingState } from '@/features/events/components/EventsLoadingState'
import { EventsPagination } from '@/features/events/components/EventsPagination'
import { EventsTypeFilter } from '@/features/events/components/EventsTypeFilter'
import { useEvents } from '@/features/events/hooks/useEvents'

export function EventsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? 1)
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const typeParam = Number(searchParams.get('type'))
  const typeId = Number.isSafeInteger(typeParam) && typeParam > 0 ? typeParam : null

  const {
    events,
    pagination,
    isLoading,
    error,
    retry,
  } = useEvents(page, typeId)

  const hasEvents = events.length > 0

  const handleTypeChange = (value: string) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.delete('page')
      if (value === 'all') next.delete('type')
      else next.set('type', value)
      return next
    }, { viewTransition: true })
  }

  const handlePageChange = (nextPage: number) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      if (nextPage === 1) next.delete('page')
      else next.set('page', String(nextPage))
      return next
    }, { viewTransition: true })
  }

  const handleCreateEvent = () => {
    navigate('/crear', {
      viewTransition: true,
    })
  }

  return (
    <PageContainer breadcrumbs={[{ label: 'Hoy', to: '/hoy' }, { label: 'Eventos' }]}>
      <PageContent>
        <PageHeader
          title="Eventos"
          description="Todos tus eventos y su estado de preparación."
          action={
            <PageHeaderCreateButton
              onClick={handleCreateEvent}
            />
          }
        />

        <div className="mt-10">
          <EventsTypeFilter typeId={typeId} onChange={handleTypeChange} />
          <div className="mt-6">
            {isLoading && (
              <EventsLoadingState />
            )}

            {!isLoading && error && (
              <EventsErrorState
                onRetry={retry}
              />
            )}

            {!isLoading &&
              !error &&
              !hasEvents && (
                <EmptyEventsState filtered={typeId !== null} onClearFilter={() => handleTypeChange('all')} />
              )}

            {!isLoading &&
              !error &&
              hasEvents && (
                <>
                  <section
                    className="grid gap-y-[30px] lg:grid-cols-2 lg:gap-x-10"
                    aria-label="Lista de eventos"
                  >
                    {events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </section>
                  {pagination && (
                    <EventsPagination pagination={pagination} onPageChange={handlePageChange} />
                  )}
                </>
              )}
          </div>
        </div>
      </PageContent>
    </PageContainer>
  )
}
