import { apiRequest } from '@/lib/api'

export type PlanningPreferences = {
  dailyLimitHours: number
  configured: boolean
}

type PreferencesResponse = {
  success: boolean
  data: { daily_limit_hours: string; daily_limit_configured: boolean }
}

export type PlanningRequest = typeof apiRequest

function mapPreferences(response: PreferencesResponse): PlanningPreferences {
  const hours = Number(response.data.daily_limit_hours)
  if (!response.success || !Number.isFinite(hours) || hours < 1 || hours > 16) {
    throw new Error('No pudimos consultar tu límite diario.')
  }
  return { dailyLimitHours: hours, configured: response.data.daily_limit_configured }
}

export async function getPlanningPreferences(request: PlanningRequest = apiRequest) {
  return mapPreferences(await request<PreferencesResponse>('/api/auth/preferences/'))
}

export async function savePlanningPreferences(hours: number, request: PlanningRequest = apiRequest, onlyIfUnconfigured = false) {
  return mapPreferences(await request<PreferencesResponse>('/api/auth/preferences/', {
    method: 'PUT', body: JSON.stringify({ daily_limit_hours: hours.toFixed(2), ...(onlyIfUnconfigured ? { only_if_unconfigured: true } : {}) }),
  }))
}
