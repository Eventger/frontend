import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { getEventSubtasks } from '@/features/events/services/subtasks.service'
import type { Subtask } from '@/features/events/types/subtask.types'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'

export function useEventSubtasks(
  eventId: number | null,
) {
  const {
    authenticatedRequest,
    isAuthLoaded,
    isSignedIn,
  } = useAuthenticatedApi()

  const [subtasks, setSubtasks] =
    useState<Subtask[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const loadSubtasks = useCallback(
    async () => {
      if (eventId === null) {
        setSubtasks([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data =
          await getEventSubtasks(
            eventId,
            authenticatedRequest,
          )

        setSubtasks(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las subtareas',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [
      eventId,
      authenticatedRequest,
    ],
  )

  useEffect(() => {
    if (!isAuthLoaded) {
      return
    }

    if (!isSignedIn) {
      return
    }

    void Promise.resolve().then(
      loadSubtasks,
    )
  }, [
    isAuthLoaded,
    isSignedIn,
    loadSubtasks,
  ])

  return {
    subtasks,
    isLoading:
      isAuthLoaded && !isSignedIn
        ? false
        : isLoading,
    error,
    refresh: loadSubtasks,
  }
}
