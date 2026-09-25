import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  getToday,
} from '@/features/today/services/today.service'

import type {
  TodayData,
} from '@/features/today/types/today.types'

export function useToday() {
  const [data, setData] =
    useState<TodayData | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const loadToday =
    useCallback(async () => {
      try {
        setIsLoading(true)
        setError(null)

        const today =
          await getToday()

        setData(today)
      } catch {
        setError(
          'No pudimos cargar tus tareas.',
        )
      } finally {
        setIsLoading(false)
      }
    }, [])

  useEffect(() => {
    void loadToday()
  }, [loadToday])

  return {
    data,
    isLoading,
    error,
    retry: loadToday,
  }
}