export const DEFAULT_DAILY_LIMIT_HOURS = 6

export function isValidDailyLimit(value: number) {
  return Number.isFinite(value) && value >= 1 && value <= 16 && Math.abs(value * 100 - Math.round(value * 100)) < 1e-8
}

// These are planning preferences, never authorization or account permissions.
export function getDailyLimitHours(metadata: Record<string, unknown> | undefined) {
  const preferences = metadata?.eventger
  if (typeof preferences !== 'object' || preferences === null) {
    return DEFAULT_DAILY_LIMIT_HOURS
  }
  const value = 'dailyLimitHours' in preferences ? preferences.dailyLimitHours : undefined
  return typeof value === 'number' && isValidDailyLimit(value)
    ? value
    : DEFAULT_DAILY_LIMIT_HOURS
}
