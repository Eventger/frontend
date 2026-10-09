import { useCallback, useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/react'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { getPlanningPreferences, savePlanningPreferences } from '../services/planningPreferences.service'
import { DEFAULT_DAILY_LIMIT_HOURS, getDailyLimitHours, validateDailyLimitForTasks } from '../utils/preferences'
import { getToday } from '@/features/today/services/today.service'

export function usePlanningPreferences() {
  const { user } = useUser()
  const { authenticatedRequest, isAuthLoaded, isSignedIn } = useAuthenticatedApi()
  const accountId = user?.id
  const legacyLimit = getDailyLimitHours(user?.unsafeMetadata)
  const [limit, setLimit] = useState(DEFAULT_DAILY_LIMIT_HOURS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const version = useRef(0)

  const refresh = useCallback(async () => {
    const current = ++version.current
    setLoading(true)
    setError('')
    try {
      let preferences = await getPlanningPreferences(authenticatedRequest)
      if (current !== version.current) return
      // Importa una preferencia anterior válida una sola vez; Clerk conserva sus demás metadatos.
      if (!preferences.configured && legacyLimit !== DEFAULT_DAILY_LIMIT_HOURS) {
        preferences = await savePlanningPreferences(legacyLimit, authenticatedRequest, true)
      }
      if (current === version.current) setLimit(preferences.dailyLimitHours)
    } catch {
      if (current === version.current) setError('No pudimos cargar tu límite diario. Inténtalo de nuevo.')
    } finally {
      if (current === version.current) setLoading(false)
    }
  }, [authenticatedRequest, legacyLimit])

  useEffect(() => {
    const requests = version
    let active = true
    if (isAuthLoaded && isSignedIn) {
      void Promise.resolve().then(() => { if (active) void refresh() })
    }
    return () => { active = false; requests.current++ }
  }, [accountId, isAuthLoaded, isSignedIn, refresh])

  const save = async (hours: number) => {
    const current = ++version.current
    if (hours < limit) {
      const tasks = await getToday(authenticatedRequest)
      if (current !== version.current) return
      validateDailyLimitForTasks(hours, tasks)
    }
    const preferences = await savePlanningPreferences(hours, authenticatedRequest)
    if (current === version.current) setLimit(preferences.dailyLimitHours)
  }

  return { dailyLimitHours: limit, isLoading: loading, error, refresh, save }
}
