import { useCallback, useEffect, useState } from 'react'

import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { getEventById, getEvents } from '@/features/events/services/event.service'
import type { Event } from '@/features/events/types/event.types'

export interface EventProgressItem {
  event: Event
  completedCount: number
  totalCount: number
  percentage: number
}

interface ProgressData {
  events: EventProgressItem[]
}

export function useProgress() {
  const { authenticatedRequest } = useAuthenticatedApi()
  const [data, setData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setRequestVersion(version => version + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function loadProgress() {
      setIsLoading(true)
      setError(false)

      try {
        // 1. Cargar todas las páginas de eventos
        const firstPage = await getEvents(1, authenticatedRequest)
        const allEvents = [...firstPage.events]

        for (let currentPage = 2; currentPage <= firstPage.pagination.totalPages; currentPage++) {
          const nextPage = await getEvents(currentPage, authenticatedRequest)
          allEvents.push(...nextPage.events)
        }

        // 2. Obtener el progreso calculado directamente del backend (/events/{id}/)
        const eventsWithBackendProgress = await Promise.all(
          allEvents.map(async (eventSummary) => {
            const detailedEvent = await getEventById(eventSummary.id, authenticatedRequest)
            const progress = detailedEvent.progress ?? { completed: 0, total: 0, percentage: 0 }

            return {
              event: detailedEvent,
              completedCount: progress.completed,
              totalCount: progress.total,
              percentage: progress.percentage,
            }
          }),
        )

        if (active) {
          setData({ events: eventsWithBackendProgress })
          setError(false)
        }
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadProgress()
    return () => { active = false }
  }, [authenticatedRequest, requestVersion])

  return { data, isLoading, error, retry }
}