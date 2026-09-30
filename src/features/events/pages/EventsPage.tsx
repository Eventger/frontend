import { useNavigate } from 'react-router'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { EmptyEventsState } from '@/features/events/components/EmptyEventsState'
import { EventCard } from '@/features/events/components/EventCard'
import { EventsErrorState } from '@/features/events/components/EventsErrorState'
import { EventsLoadingState } from '@/features/events/components/EventsLoadingState'
import { useEvents } from '@/features/events/hooks/useEvents'

export function EventsPage() {
  const navigate = useNavigate()

  const {
    events,
    isLoading,
    error,
    retry,
  } = useEvents()

  const hasEvents = events.length > 0

  const handleCreateEvent = () => {
    navigate('/crear', {
      viewTransition: true,
    })
  }

  return (
    <PageContainer>
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
              <EmptyEventsState />
            )}

          {!isLoading &&
            !error &&
            hasEvents && (
              <section
                className="grid max-w-[1040px] gap-y-[30px] lg:grid-cols-2 lg:gap-x-10"
                aria-label="Lista de eventos"
              >
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                ))}
              </section>
            )}
        </div>
    </PageContainer>
  )
}
