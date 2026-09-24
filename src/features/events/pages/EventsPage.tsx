import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
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

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 md:px-12 md:pt-[52px]">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
              Eventos
            </h1>

            <p className="mt-2 text-sm text-[#667085] md:text-[15px]">
              Todos tus eventos y su estado de preparación.
            </p>
          </div>

          {hasEvents && (
            <Button
              type="button"
              onClick={() => navigate('/crear')}
              className="hidden h-11 w-40 rounded-[10px] bg-[#4f46e5] text-[14px] font-semibold text-white hover:bg-[#4338ca] sm:flex"
            >
              <Plus />
              Crear evento
            </Button>
          )}
        </header>

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
      </div>
    </AppLayout>
  )
}
