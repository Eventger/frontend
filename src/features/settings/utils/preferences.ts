export const DEFAULT_DAILY_LIMIT_HOURS = 6

export function isValidDailyLimit(value: number) {
  return Number.isFinite(value) && value >= 0.5 && value <= 24 && value * 2 % 1 === 0
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
