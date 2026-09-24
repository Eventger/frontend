import { useCallback, useEffect, useState } from 'react'

import { getEventSubtasks } from '@/features/events/services/subtasks.service'
import type { Subtask } from '@/features/events/types/subtask.types'

export function useEventSubtasks(
  eventId: number | null,
) {
  const [subtasks, setSubtasks] =
    useState<Subtask[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const loadSubtasks = useCallback(async () => {
    if (eventId === null) {
      setSubtasks([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await getEventSubtasks(eventId)

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
  }, [eventId])

  useEffect(() => {
    void loadSubtasks()
  }, [loadSubtasks])

  return {
    subtasks,
    isLoading,
    error,
    refresh: loadSubtasks,
  }
}