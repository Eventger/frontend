import { useEffect, useState } from 'react'
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
import { EventsSearchInput } from '@/features/events/components/EventsSearchInput'
import { EventsTypeFilter } from '@/features/events/components/EventsTypeFilter'
import { useEvents } from '@/features/events/hooks/useEvents'

export function EventsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? 1)
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const typeParam = Number(searchParams.get('type'))
  const typeId = Number.isSafeInteger(typeParam) && typeParam > 0 ? typeParam : null
  const searchParam = searchParams.get('search') ?? ''

  const {
    events,
    pagination,
    isLoading,
    error,
    retry,
  } = useEvents(page, typeId, searchParam)

  useEffect(() => {
    if (!isLoading && !error && pagination && pagination.total > 0 && pagination.totalPages > 0) {
      if (page > pagination.totalPages) {
        setSearchParams(previous => {
          const next = new URLSearchParams(previous)
          if (pagination.totalPages === 1) next.delete('page')
          else next.set('page', String(pagination.totalPages))
          return next
        }, { replace: true })
      }
    }
  }, [isLoading, error, pagination, page, setSearchParams])

  const hasEvents = events.length > 0
  const hasActiveFilters = typeId !== null || Boolean(searchParam.trim())
  const [hasEverHadEvents, setHasEverHadEvents] = useState(hasEvents || hasActiveFilters)
  if (!hasEverHadEvents && (hasEvents || hasActiveFilters)) {
    setHasEverHadEvents(true)
  }

  const showFilters = hasEvents || hasActiveFilters || hasEverHadEvents

  const handleSearchChange = (value: string) => {
    const trimmed = value.trim()
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      const current = next.get('search') ?? ''
      if (current === trimmed) return previous
      next.delete('page')
      if (trimmed) next.set('search', trimmed)
      else next.delete('search')
      return next
    }, { replace: true })
  }

  const handleTypeChange = (value: string) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.delete('page')
      if (value === 'all') next.delete('type')
      else next.set('type', value)
      return next
    })
  }

  const handleClearAllFilters = () => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.delete('page')
      next.delete('type')
      next.delete('search')
      return next
    })
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
            <span className="md:hidden">
              <PageHeaderCreateButton
                onClick={handleCreateEvent}
              />
            </span>
          }
        />

        {/* Estado de carga inicial cuando la cuenta no tiene eventos conocidos ni filtros */}
        {isLoading && !showFilters && (
          <div className="mt-10">
            <EventsLoadingState />
          </div>
        )}

        {/* Estado de error inicial sin filtros */}
        {!isLoading && error && !showFilters && (
          <div className="mt-10 md:mt-[116px]">
            <EventsErrorState onRetry={retry} />
          </div>
        )}

        {/* Contenedor principal con filtros persistentes y sin saltos visuales */}
        {(showFilters || (!isLoading && !error)) && (
          <div className="mt-10">
            {showFilters && (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
                <div className="w-full lg:max-w-[340px]">
                  <EventsSearchInput
                    value={searchParam}
                    onChange={handleSearchChange}
                    isLoading={isLoading}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <EventsTypeFilter typeId={typeId} onChange={handleTypeChange} />
                </div>
              </div>
            )}

            <div className={showFilters ? 'mt-6' : undefined}>
              {error ? (
                <div className="mt-6">
                  <EventsErrorState onRetry={retry} />
                </div>
              ) : isLoading && !hasEvents ? (
                <EventsLoadingState />
              ) : !hasEvents ? (
                <EmptyEventsState
                  filtered={hasActiveFilters}
                  search={searchParam}
                  onClearFilter={handleClearAllFilters}
                />
              ) : (
                <div className="relative">
                  <section
                    className={`grid gap-y-[30px] lg:grid-cols-2 2xl:grid-cols-3 lg:gap-x-10 transition-opacity duration-200 ${
                      isLoading ? 'pointer-events-none opacity-50' : 'opacity-100'
                    }`}
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
                </div>
              )}
            </div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  )
}
